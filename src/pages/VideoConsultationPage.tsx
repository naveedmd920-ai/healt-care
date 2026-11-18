import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  ShieldAlert,
  Play,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SafeImage } from '../components/SafeImage';
import { useAuth, getDashboardPathForRole } from '../context/AuthContext';
import { api, getApiErrorMessage, TOKEN_STORAGE_KEY } from '../services/api';

interface ChatMsg {
  sender: string;
  text: string;
  time: string;
}

export function VideoConsultationPage() {
  const { appointmentId } = useParams();
  const { user } = useAuth();

  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Media & WebRTC state
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [callStarted, setCallStarted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Not started');
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [mediaNotice, setMediaNotice] = useState('');

  // In-room text chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Doctor notes form
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMsg, setNotesMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/appointments/${appointmentId}/consultation`)
      .then((res) => {
        const c = res.data.consultation;
        setConsultation(c);
        setDoctorNotes(c.doctor_notes || '');
        setPrescription(c.prescription_summary || '');
        setFollowUpDate(c.follow_up_date || '');
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));

    return () => {
      cleanupMediaAndSocket();
    };
  }, [appointmentId]);

  const cleanupMediaAndSocket = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const createPeerConnection = (ws: WebSocket) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteConnected(true);
        setConnectionStatus('Live WebRTC Peer Connected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteConnected(false);
        setConnectionStatus('Waiting for peer reconnection');
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const handleStartConsultation = async () => {
    if (!consultation?.room_id) return;
    setMediaNotice('');
    setConnectionStatus('Initializing devices & WebSocket signaling...');

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: consultation.consultation_mode !== 'audio',
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setCameraOn(consultation.consultation_mode !== 'audio');
          setMicOn(true);
        } catch {
          setMediaNotice(
            'Camera/Microphone permission was not granted or unavailable. Running signaling & text chat in Demo Mode.'
          );
          setCameraOn(false);
        }
      }

      const token = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(
        `${proto}://${window.location.host}/ws/signaling?token=${encodeURIComponent(
          token
        )}&roomId=${encodeURIComponent(consultation.room_id)}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setCallStarted(true);
        setConnectionStatus('Signaling Connected (Waiting for second peer or Demo Mode)');
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room-joined') {
          if (msg.peers && msg.peers.length > 0) {
            const pc = createPeerConnection(ws);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: 'offer', offer }));
            setConnectionStatus('Connecting to peer...');
          }
        } else if (msg.type === 'peer-joined') {
          setConnectionStatus(`${msg.name} joined room — establishing WebRTC...`);
        } else if (msg.type === 'offer') {
          const pc = pcRef.current || createPeerConnection(ws);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: 'answer', answer }));
        } else if (msg.type === 'answer' && pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.answer));
        } else if (msg.type === 'ice-candidate' && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch {
            // Ignore late ICE candidates
          }
        } else if (msg.type === 'peer-left') {
          setRemoteConnected(false);
          setConnectionStatus('Peer left the room');
        } else if (msg.type === 'chat-message') {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: msg.senderName || 'Participant',
              text: msg.text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('Signaling connection error — Demo Mode active');
      };

      await api.put(`/appointments/${appointmentId}/consultation`, {
        markStarted: true,
        connectionMode: localStreamRef.current ? 'webrtc' : 'demo_simulation',
      });
    } catch (err) {
      setMediaNotice(getApiErrorMessage(err));
    }
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !cameraOn;
    });
    setCameraOn((v) => !v);
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !micOn;
    });
    setMicOn((v) => !v);
  };

  const handleEndCall = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call-ended' }));
    }
    cleanupMediaAndSocket();
    setCallStarted(false);
    setRemoteConnected(false);
    setConnectionStatus('Call Ended');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat-message', text }));
    }
    setChatMessages((prev) => [
      ...prev,
      {
        sender: `${user?.full_name} (You)`,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleSaveNotes = async (markCompleted = false) => {
    setSavingNotes(true);
    setNotesMsg('');
    try {
      await api.put(`/appointments/${appointmentId}/consultation`, {
        doctorNotes,
        prescriptionSummary: prescription,
        followUpDate: followUpDate || undefined,
        markCompleted,
      });
      setNotesMsg(
        markCompleted
          ? 'Consultation marked as completed and notes saved.'
          : 'Consultation notes saved.'
      );
      if (markCompleted) {
        setConsultation((prev: any) => ({ ...prev, status: 'completed' }));
      }
    } catch (err) {
      setNotesMsg(getApiErrorMessage(err));
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-950">
              Telemedicine Consultation Room
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Restricted to assigned patient and doctor · WebRTC Signaling Room
            </p>
          </div>
          <Link
            to={getDashboardPathForRole(user?.role)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-emerald-950/15 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-xl border border-emerald-950/10 text-sm text-slate-600">
            Loading authorized consultation room...
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-900">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Video Call & Controls */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-4 rounded-xl bg-white border border-emerald-950/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      remoteConnected
                        ? 'bg-emerald-600'
                        : callStarted
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>Connection Status: {connectionStatus}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Room: {consultation.room_id}
                </span>
              </div>

              {mediaNotice && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  {mediaNotice}
                </div>
              )}

              {/* Video Canvas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-emerald-950/15 flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${remoteConnected ? 'block' : 'hidden'}`}
                  />
                  {!remoteConnected && (
                    <div className="p-6 text-center space-y-2 text-slate-300">
                      <SafeImage
                        src={consultation.doctor_avatar}
                        alt={consultation.doctor_name}
                        className="w-16 h-16 rounded-full mx-auto object-cover border border-white/20"
                      />
                      <div className="text-sm font-semibold text-white">
                        {user?.role === 'doctor'
                          ? consultation.patient_name
                          : consultation.doctor_name}
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {callStarted
                          ? 'Demo / Waiting Mode: Open this same appointment room in a second browser session as the other party to test live peer-to-peer WebRTC.'
                          : 'Click Start Consultation below to join the signaling room and activate your camera/microphone.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-emerald-950/15 flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${
                      callStarted && cameraOn ? 'block' : 'hidden'
                    }`}
                  />
                  {(!callStarted || !cameraOn) && (
                    <div className="text-xs text-slate-300">
                      {callStarted ? 'Camera is turned off' : 'Local Camera Preview'}
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/70 text-[11px] text-white">
                    You ({user?.role})
                  </span>
                </div>
              </div>

              {/* Call Controls */}
              <div className="p-4 rounded-xl bg-white border border-emerald-950/10 flex flex-wrap items-center justify-center gap-3">
                {!callStarted ? (
                  <button
                    type="button"
                    onClick={handleStartConsultation}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Consultation</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        cameraOn
                          ? 'bg-white text-slate-800 border-emerald-950/15'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      <span>{cameraOn ? 'Camera On' : 'Camera Off'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        micOn
                          ? 'bg-white text-slate-800 border-emerald-950/15'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}
                    >
                      {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      <span>{micOn ? 'Mic On' : 'Mic Muted'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Call</span>
                    </button>
                  </>
                )}
              </div>

              {/* Doctor Clinical Notes & Prescription Summary */}
              <div className="p-5 rounded-xl bg-white border border-emerald-950/10 space-y-3">
                <h2 className="text-base font-bold text-slate-900">
                  Consultation Notes & Advice
                </h2>
                {notesMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    {notesMsg}
                  </div>
                )}

                {user?.role === 'doctor' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Clinical Observations
                      </label>
                      <textarea
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Record consultation observations..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Care Advice / Prescription Summary
                      </label>
                      <textarea
                        rows={2}
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder="Guidance and follow-up instructions..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                      />
                      <button
                        type="button"
                        disabled={savingNotes}
                        onClick={() => handleSaveNotes(false)}
                        className="px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-700/20 rounded-lg cursor-pointer"
                      >
                        Save Notes
                      </button>
                      <button
                        type="button"
                        disabled={savingNotes}
                        onClick={() => handleSaveNotes(true)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                      >
                        Save & Mark Completed
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">Doctor Notes: </span>
                      <span>{consultation.doctor_notes || 'Notes will appear after the doctor updates them.'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Care Summary: </span>
                      <span>{consultation.prescription_summary || 'Pending consultation summary.'}</span>
                    </div>
                    {consultation.follow_up_date && (
                      <div>
                        <span className="font-semibold text-slate-900">Follow-up Date: </span>
                        <span className="font-mono">{consultation.follow_up_date}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Appointment Details & Live Text Chat */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-xl bg-white border border-emerald-950/10 space-y-3">
                <h2 className="text-sm font-bold text-slate-900">Appointment Details</h2>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Doctor:</span>{' '}
                    {consultation.doctor_name} ({consultation.specialization})
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Patient:</span>{' '}
                    {consultation.patient_name}{' '}
                    {consultation.patient_village ? `· ${consultation.patient_village}` : ''}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Schedule:</span>{' '}
                    <span className="font-mono tabular-nums">
                      {consultation.appointment_date} {consultation.time_slot}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Status:</span>{' '}
                    <span className="capitalize font-medium text-emerald-800">
                      {consultation.status}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="font-semibold text-slate-800">Symptoms:</span>
                    <p className="mt-0.5 text-slate-700">{consultation.symptoms}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-emerald-950/10 flex flex-col h-[340px]">
                <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-emerald-950/10">
                  Consultation Text Chat
                </h2>
                <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
                  {chatMessages.length === 0 ? (
                    <p className="text-slate-400">
                      Send text notes or medicine names over the WebSocket room channel.
                    </p>
                  ) : (
                    chatMessages.map((m, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#F8FAF9] border border-emerald-950/10">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-800">{m.sender}</span>
                          <span className="font-mono">{m.time}</span>
                        </div>
                        <p className="text-slate-700 mt-0.5">{m.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendChat} className="pt-2 border-t border-emerald-950/10 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-emerald-950/15 bg-[#F8FAF9]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-emerald-700 text-white rounded-lg cursor-pointer"
                    aria-label="Send chat message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
