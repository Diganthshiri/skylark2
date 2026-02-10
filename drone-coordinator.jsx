import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, CheckCircle, Loader2, Database } from 'lucide-react';

// Data Store - In production, this would be in a database with Google Sheets sync
const DroneCoordinator = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Drone Operations Coordinator AI. I can help you with:\n\n• Checking pilot availability and skills\n• Assigning pilots to missions\n• Managing drone inventory\n• Detecting conflicts and issues\n• Handling urgent reassignments\n\nHow can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  // Sample data - loaded from CSV files
  const [pilots, setPilots] = useState([
    { pilot_id: 'P001', name: 'Arjun', skills: ['Mapping', 'Survey'], certifications: ['DGCA', 'Night Ops'], location: 'Bangalore', status: 'Available', current_assignment: null, available_from: '2026-02-05' },
    { pilot_id: 'P002', name: 'Neha', skills: ['Inspection'], certifications: ['DGCA'], location: 'Mumbai', status: 'Assigned', current_assignment: 'PRJ001', available_from: '2026-02-12' },
    { pilot_id: 'P003', name: 'Rohit', skills: ['Inspection', 'Mapping'], certifications: ['DGCA'], location: 'Mumbai', status: 'Available', current_assignment: null, available_from: '2026-02-05' },
    { pilot_id: 'P004', name: 'Sneha', skills: ['Survey', 'Thermal'], certifications: ['DGCA', 'Night Ops'], location: 'Bangalore', status: 'On Leave', current_assignment: null, available_from: '2026-02-15' }
  ]);

  const [drones, setDrones] = useState([
    { drone_id: 'D001', model: 'DJI M300', capabilities: ['LiDAR', 'RGB'], status: 'Available', location: 'Bangalore', current_assignment: null, maintenance_due: '2026-03-01' },
    { drone_id: 'D002', model: 'DJI Mavic 3', capabilities: ['RGB'], status: 'Maintenance', location: 'Mumbai', current_assignment: null, maintenance_due: '2026-02-01' },
    { drone_id: 'D003', model: 'DJI Mavic 3T', capabilities: ['Thermal'], status: 'Available', location: 'Mumbai', current_assignment: null, maintenance_due: '2026-04-01' },
    { drone_id: 'D004', model: 'Autel Evo II', capabilities: ['Thermal', 'RGB'], status: 'Available', location: 'Bangalore', current_assignment: null, maintenance_due: '2026-03-15' }
  ]);

  const [missions, setMissions] = useState([
    { project_id: 'PRJ001', client: 'Client A', location: 'Bangalore', required_skills: ['Mapping'], required_certs: ['DGCA'], start_date: '2026-02-06', end_date: '2026-02-08', priority: 'High', assigned_pilot: null, assigned_drone: null },
    { project_id: 'PRJ002', client: 'Client B', location: 'Mumbai', required_skills: ['Inspection'], required_certs: ['DGCA', 'Night Ops'], start_date: '2026-02-07', end_date: '2026-02-09', priority: 'Urgent', assigned_pilot: null, assigned_drone: null },
    { project_id: 'PRJ003', client: 'Client C', location: 'Bangalore', required_skills: ['Thermal'], required_certs: ['DGCA'], start_date: '2026-02-10', end_date: '2026-02-12', priority: 'Standard', assigned_pilot: null, assigned_drone: null }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setDataLoaded(true);
  }, []);

  // Utility functions
  const parseDate = (dateStr) => new Date(dateStr);

  const datesOverlap = (start1, end1, start2, end2) => {
    const s1 = parseDate(start1);
    const e1 = parseDate(end1);
    const s2 = parseDate(start2);
    const e2 = parseDate(end2);
    return s1 <= e2 && s2 <= e1;
  };

  // Conflict detection
  const detectConflicts = (pilotId, droneId, projectId) => {
    const conflicts = [];
    const project = missions.find(m => m.project_id === projectId);
    
    if (!project) return conflicts;

    // Check pilot conflicts
    if (pilotId) {
      const pilot = pilots.find(p => p.pilot_id === pilotId);
      
      // Check availability status
      if (pilot.status === 'On Leave') {
        conflicts.push({
          type: 'pilot_unavailable',
          severity: 'high',
          message: `${pilot.name} is currently on leave until ${pilot.available_from}`
        });
      }

      // Check skill match
      const hasRequiredSkills = project.required_skills.every(skill => 
        pilot.skills.includes(skill)
      );
      if (!hasRequiredSkills) {
        conflicts.push({
          type: 'skill_mismatch',
          severity: 'high',
          message: `${pilot.name} lacks required skills: ${project.required_skills.join(', ')}. Pilot has: ${pilot.skills.join(', ')}`
        });
      }

      // Check certifications
      const hasRequiredCerts = project.required_certs.every(cert => 
        pilot.certifications.includes(cert)
      );
      if (!hasRequiredCerts) {
        conflicts.push({
          type: 'cert_mismatch',
          severity: 'high',
          message: `${pilot.name} lacks required certifications: ${project.required_certs.join(', ')}`
        });
      }

      // Check location match
      if (pilot.location !== project.location) {
        conflicts.push({
          type: 'location_mismatch',
          severity: 'medium',
          message: `${pilot.name} is in ${pilot.location} but project is in ${project.location}`
        });
      }

      // Check for double booking
      const overlappingMissions = missions.filter(m => 
        m.assigned_pilot === pilotId && 
        m.project_id !== projectId &&
        datesOverlap(m.start_date, m.end_date, project.start_date, project.end_date)
      );
      if (overlappingMissions.length > 0) {
        conflicts.push({
          type: 'double_booking',
          severity: 'high',
          message: `${pilot.name} is already assigned to ${overlappingMissions[0].project_id} during overlapping dates`
        });
      }
    }

    // Check drone conflicts
    if (droneId) {
      const drone = drones.find(d => d.drone_id === droneId);
      
      if (drone.status === 'Maintenance') {
        conflicts.push({
          type: 'drone_maintenance',
          severity: 'high',
          message: `${drone.model} (${drone.drone_id}) is currently in maintenance`
        });
      }

      if (drone.location !== project.location) {
        conflicts.push({
          type: 'drone_location_mismatch',
          severity: 'medium',
          message: `Drone is in ${drone.location} but project is in ${project.location}`
        });
      }

      // Check drone double booking
      const overlappingDroneMissions = missions.filter(m => 
        m.assigned_drone === droneId && 
        m.project_id !== projectId &&
        datesOverlap(m.start_date, m.end_date, project.start_date, project.end_date)
      );
      if (overlappingDroneMissions.length > 0) {
        conflicts.push({
          type: 'drone_double_booking',
          severity: 'high',
          message: `Drone ${drone.drone_id} is already assigned to ${overlappingDroneMissions[0].project_id}`
        });
      }
    }

    return conflicts;
  };

  // Find best pilot for a mission
  const findBestPilot = (projectId) => {
    const project = missions.find(m => m.project_id === projectId);
    if (!project) return null;

    const availablePilots = pilots.filter(p => {
      if (p.status !== 'Available') return false;
      
      const hasSkills = project.required_skills.every(skill => p.skills.includes(skill));
      const hasCerts = project.required_certs.every(cert => p.certifications.includes(cert));
      
      return hasSkills && hasCerts;
    });

    // Prefer pilots in same location
    const localPilots = availablePilots.filter(p => p.location === project.location);
    return localPilots.length > 0 ? localPilots[0] : availablePilots[0];
  };

  // Find best drone for a mission
  const findBestDrone = (projectId) => {
    const project = missions.find(m => m.project_id === projectId);
    if (!project) return null;

    const availableDrones = drones.filter(d => d.status === 'Available');
    
    // Prefer drones in same location
    const localDrones = availableDrones.filter(d => d.location === project.location);
    return localDrones.length > 0 ? localDrones[0] : availableDrones[0];
  };

  // Process user query with AI-like logic
  const processQuery = async (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Query pilot availability
    if (lowerQuery.includes('pilot') && (lowerQuery.includes('available') || lowerQuery.includes('who'))) {
      const availablePilots = pilots.filter(p => p.status === 'Available');
      if (availablePilots.length === 0) {
        return 'Currently, no pilots are available. All pilots are either assigned or on leave.';
      }
      
      let response = `**Available Pilots (${availablePilots.length}):**\n\n`;
      availablePilots.forEach(p => {
        response += `• **${p.name}** (${p.pilot_id})\n`;
        response += `  - Skills: ${p.skills.join(', ')}\n`;
        response += `  - Certifications: ${p.certifications.join(', ')}\n`;
        response += `  - Location: ${p.location}\n\n`;
      });
      return response;
    }

    // Query by skill
    if (lowerQuery.includes('mapping') || lowerQuery.includes('inspection') || lowerQuery.includes('thermal') || lowerQuery.includes('survey')) {
      let skill = '';
      if (lowerQuery.includes('mapping')) skill = 'Mapping';
      if (lowerQuery.includes('inspection')) skill = 'Inspection';
      if (lowerQuery.includes('thermal')) skill = 'Thermal';
      if (lowerQuery.includes('survey')) skill = 'Survey';
      
      const skilledPilots = pilots.filter(p => p.skills.includes(skill) && p.status === 'Available');
      
      if (skilledPilots.length === 0) {
        return `No available pilots with ${skill} skills at the moment.`;
      }
      
      let response = `**Available pilots with ${skill} skills:**\n\n`;
      skilledPilots.forEach(p => {
        response += `• **${p.name}** (${p.pilot_id}) - ${p.location}\n`;
      });
      return response;
    }

    // Drone availability
    if (lowerQuery.includes('drone') && lowerQuery.includes('available')) {
      const availableDrones = drones.filter(d => d.status === 'Available');
      
      let response = `**Available Drones (${availableDrones.length}):**\n\n`;
      availableDrones.forEach(d => {
        response += `• **${d.model}** (${d.drone_id})\n`;
        response += `  - Capabilities: ${d.capabilities.join(', ')}\n`;
        response += `  - Location: ${d.location}\n`;
        response += `  - Maintenance Due: ${d.maintenance_due}\n\n`;
      });
      return response;
    }

    // Check mission status
    if (lowerQuery.includes('mission') || lowerQuery.includes('project')) {
      let response = `**Active Missions:**\n\n`;
      missions.forEach(m => {
        response += `• **${m.project_id}** - ${m.client} (${m.priority} priority)\n`;
        response += `  - Location: ${m.location}\n`;
        response += `  - Dates: ${m.start_date} to ${m.end_date}\n`;
        response += `  - Required Skills: ${m.required_skills.join(', ')}\n`;
        response += `  - Assigned Pilot: ${m.assigned_pilot || 'None'}\n`;
        response += `  - Assigned Drone: ${m.assigned_drone || 'None'}\n\n`;
      });
      return response;
    }

    // Assign pilot to project
    if (lowerQuery.includes('assign') && lowerQuery.includes('to')) {
      const projectMatch = query.match(/PRJ\d+/i);
      const pilotMatch = query.match(/P\d+/i);
      
      if (projectMatch) {
        const projectId = projectMatch[0].toUpperCase();
        const project = missions.find(m => m.project_id === projectId);
        
        if (!project) {
          return `Project ${projectId} not found.`;
        }

        let pilotId = pilotMatch ? pilotMatch[0].toUpperCase() : null;
        
        // Auto-suggest if no pilot specified
        if (!pilotId) {
          const bestPilot = findBestPilot(projectId);
          if (!bestPilot) {
            return `No suitable pilots available for ${projectId}. Required skills: ${project.required_skills.join(', ')}, Certifications: ${project.required_certs.join(', ')}`;
          }
          pilotId = bestPilot.pilot_id;
        }

        const conflicts = detectConflicts(pilotId, null, projectId);
        
        if (conflicts.some(c => c.severity === 'high')) {
          let response = `⚠️ **Cannot assign ${pilotId} to ${projectId}. Issues detected:**\n\n`;
          conflicts.forEach(c => {
            response += `• ${c.message}\n`;
          });
          return response;
        }

        // Make assignment
        const updatedMissions = missions.map(m => 
          m.project_id === projectId ? { ...m, assigned_pilot: pilotId } : m
        );
        setMissions(updatedMissions);

        const updatedPilots = pilots.map(p => 
          p.pilot_id === pilotId ? { ...p, status: 'Assigned', current_assignment: projectId } : p
        );
        setPilots(updatedPilots);

        let response = `✅ **Assignment successful!**\n\n`;
        response += `Assigned ${pilots.find(p => p.pilot_id === pilotId).name} to ${projectId}\n\n`;
        
        if (conflicts.length > 0) {
          response += `⚠️ **Warnings:**\n`;
          conflicts.forEach(c => {
            response += `• ${c.message}\n`;
          });
        }
        
        return response;
      }
    }

    // Update pilot status
    if (lowerQuery.includes('update') && lowerQuery.includes('status')) {
      const pilotMatch = query.match(/P\d+/i);
      const statusMatch = query.match(/\b(available|on leave|unavailable|assigned)\b/i);
      
      if (pilotMatch && statusMatch) {
        const pilotId = pilotMatch[0].toUpperCase();
        const newStatus = statusMatch[0];
        
        const updatedPilots = pilots.map(p => 
          p.pilot_id === pilotId ? { ...p, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : p
        );
        setPilots(updatedPilots);
        
        return `✅ Updated ${pilots.find(p => p.pilot_id === pilotId).name}'s status to: ${newStatus}`;
      }
    }

    // Detect conflicts
    if (lowerQuery.includes('conflict') || lowerQuery.includes('issue')) {
      let allConflicts = [];
      
      missions.forEach(m => {
        if (m.assigned_pilot || m.assigned_drone) {
          const conflicts = detectConflicts(m.assigned_pilot, m.assigned_drone, m.project_id);
          if (conflicts.length > 0) {
            allConflicts.push({ project: m.project_id, conflicts });
          }
        }
      });

      if (allConflicts.length === 0) {
        return '✅ No conflicts detected in current assignments.';
      }

      let response = '⚠️ **Conflicts Detected:**\n\n';
      allConflicts.forEach(({ project, conflicts }) => {
        response += `**${project}:**\n`;
        conflicts.forEach(c => {
          response += `• ${c.message}\n`;
        });
        response += '\n';
      });
      return response;
    }

    // Urgent reassignment
    if (lowerQuery.includes('urgent') || lowerQuery.includes('reassign')) {
      const urgentMissions = missions.filter(m => m.priority === 'Urgent' && !m.assigned_pilot);
      
      if (urgentMissions.length === 0) {
        return 'No urgent missions requiring reassignment at this time.';
      }

      let response = '🚨 **Urgent Mission Alert:**\n\n';
      urgentMissions.forEach(m => {
        response += `**${m.project_id}** - ${m.client}\n`;
        response += `Location: ${m.location}\n`;
        response += `Dates: ${m.start_date} to ${m.end_date}\n`;
        response += `Required: ${m.required_skills.join(', ')}\n\n`;
        
        const bestPilot = findBestPilot(m.project_id);
        if (bestPilot) {
          response += `✅ Recommended pilot: **${bestPilot.name}** (${bestPilot.pilot_id})\n`;
          response += `Type "assign ${bestPilot.pilot_id} to ${m.project_id}" to confirm.\n\n`;
        } else {
          response += `⚠️ No suitable pilots available.\n\n`;
        }
      });
      
      return response;
    }

    // Default help
    return `I can help you with:

• **Check availability**: "Who's available?" or "Available pilots with Mapping skills"
• **View missions**: "Show missions" or "Project status"
• **Assign pilots**: "Assign P001 to PRJ001" or "Assign to PRJ002"
• **Check drones**: "Available drones"
• **Detect issues**: "Check for conflicts"
• **Urgent tasks**: "Show urgent missions"
• **Update status**: "Update P001 status to On Leave"

What would you like to do?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processQuery(input);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Sorry, I encountered an error processing your request. Please try again.' 
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Skylark Drone Operations</h1>
                <p className="text-sm text-gray-600">AI Coordinator Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {dataLoaded ? 'Data Synced' : 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Available Pilots</div>
            <div className="text-2xl font-bold text-blue-600">
              {pilots.filter(p => p.status === 'Available').length}/{pilots.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Available Drones</div>
            <div className="text-2xl font-bold text-green-600">
              {drones.filter(d => d.status === 'Available').length}/{drones.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Active Missions</div>
            <div className="text-2xl font-bold text-indigo-600">{missions.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Urgent Tasks</div>
            <div className="text-2xl font-bold text-red-600">
              {missions.filter(m => m.priority === 'Urgent').length}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content.split('**').map((part, i) => 
                      i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (e.g., 'Who's available for Mapping?' or 'Assign P001 to PRJ002')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Try: "Available pilots" • "Show missions" • "Assign to PRJ001" • "Check conflicts"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneCoordinator;
