'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, Camera, X, Check, Settings, Search, AlertTriangle, 
  CheckCircle, Bell, Wifi, WifiOff, Menu, ZoomIn, ZoomOut, RotateCcw,
  FileText, Upload, Trash2, Plus
} from 'lucide-react';

const RANPROSystem = () => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [defects, setDefects] = useState([]);
  const [isAddingDefect, setIsAddingDefect] = useState(false);
  const [hoveredDefect, setHoveredDefect] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('punchlist');
  const [planImage, setPlanImage] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pushNotifications, setPushNotifications] = useState([]);
  const [newPushNotification, setNewPushNotification] = useState('');
  
  const [modalData, setModalData] = useState({
    id: null,
    description: '',
    status: 'open',
    priority: 'medium',
    contractor: '',
    location: '',
    category: 'general',
    images: [],
    closingImage: null,
    createdAt: new Date().toISOString(),
    projectId: null
  });

  const [ncrData, setNcrData] = useState({
    reportId: '',
    discoveryDate: '',
    reportedBy: '',
    roof: '',
    area: '',
    layer: '',
    defectType: '',
    requirement: '',
    description: '',
    needsCAPA: false,
    immediateAction: '',
    rootCause: '',
    preventiveAction: ''
  });

  const planRef = useRef(null);

  const contractors = [
    'קבלן חשמל - כהן חשמל',
    'קבלן אינסטלציה - לוי צנרת',
    'קבלן גבס - ישראלי גבס',
    'קבלן צבע - צבעי השרון'
  ];

  const statusOptions = [
    { value: 'open', label: '🔴 פתוח', color: 'bg-red-100 text-red-800' },
    { value: 'in_progress', label: '🟡 בטיפול', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'closed', label: '🟢 סגור', color: 'bg-green-100 text-green-800' }
  ];

  const priorityOptions = [
    { value: 'critical', label: '🚨 קריטי', color: 'bg-red-500 text-white' },
    { value: 'high', label: '⬆️ גבוה', color: 'bg-orange-500 text-white' },
    { value: 'medium', label: '➡️ בינוני', color: 'bg-yellow-500 text-white' },
    { value: 'low', label: '⬇️ נמוך', color: 'bg-green-500 text-white' }
  ];

  const areaOptions = {
    'PSSS.1': ['P1','P2','P3','P4','P5'],
    'CUB.2': ['Zone1','Zone2','Zone3','Zone4','Zone5'],
    'FAB.1': ['TTNE','TTNW','E1-5','W1-5'],
    'FAB.2': ['TTSE','TTSW','E1-5','W1-5']
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('חזרת לאונליין!', 'success');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('אתה במצב אופליין', 'warning');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    loadFromLocalStorage();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  useEffect(() => {
    saveToLocalStorage();
  }, [projects, currentProject, defects, ncrData, pushNotifications]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveToLocalStorage = () => {
    try {
      const data = {
        projects,
        currentProject,
        defects,
        ncrData,
        nextId,
        pushNotifications,
        lastSync: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ranpro_system_data', JSON.stringify(data));
      }
    } catch (error) {
      console.error('שגיאה בשמירת נתונים:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('ranpro_system_data');
        if (savedData) {
          const data = JSON.parse(savedData);
          setProjects(data.projects || []);
          setCurrentProject(data.currentProject || null);
          setDefects(data.defects || []);
          setNcrData(data.ncrData || {});
          setNextId(data.nextId || 1);
          setPushNotifications(data.pushNotifications || []);
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    }
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const newProject = {
      id: Date.now(),
      name: newProjectName.trim(),
      planImage: null,
      createdAt: new Date().toISOString()
    };
    
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setNewProjectName('');
    setShowProjectModal(false);
    showNotification(`פרויקט "${newProjectName}" נוצר בהצלחה`, 'success');
  };

  const handleProjectPlanUpload = (e, projectId) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProjects(projects.map(p => 
          p.id === projectId 
            ? { ...p, planImage: event.target.result }
            : p
        ));
        if (currentProject && currentProject.id === projectId) {
          setPlanImage(event.target.result);
        }
        showNotification('תוכנית הפרויקט הועלתה בהצלחה', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSvgClick = (e) => {
    if (!isAddingDefect || !currentProject) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (viewBox.w / rect.width) + viewBox.x;
    const y = (e.clientY - rect.top) * (viewBox.h / rect.height) + viewBox.y;
    
    const newDefect = {
      id: nextId,
      x: Math.max(20, Math.min(780, x)),
      y: Math.max(20, Math.min(580, y)),
      description: '',
      status: 'open',
      priority: 'medium',
      contractor: '',
      location: '',
      category: 'general',
      images: [],
      closingImage: null,
      createdAt: new Date().toISOString(),
      projectId: currentProject.id
    };
    
    setDefects([...defects, newDefect]);
    setNextId(nextId + 1);
    setModalData({...newDefect});
    setShowModal(true);
    setIsAddingDefect(false);
    showNotification('ליקוי חדש נוסף', 'info');
  };

  const handleZoom = (scale) => {
    const centerX = 400;
    const centerY = 300;
    const dx = centerX - viewBox.x;
    const dy = centerY - viewBox.y;
    const newW = viewBox.w * scale;
    const newH = viewBox.h * scale;
    
    setViewBox({
      x: viewBox.x + dx * (1 - scale),
      y: viewBox.y + dy * (1 - scale),
      w: newW,
      h: newH
    });
  };

  const handleDefectClick = (defect, e) => {
    if (e) e.stopPropagation();
    setModalData({...defect});
    setShowModal(true);
  };

  const handleSaveDefect = () => {
    if (!modalData.description.trim()) {
      showNotification('יש להוסיף תיאור לליקוי', 'warning');
      return;
    }

    if (modalData.id) {
      setDefects(defects.map(defect => 
        defect.id === modalData.id 
          ? { ...modalData, updatedAt: new Date().toISOString() } 
          : defect
      ));
      showNotification('הליקוי עודכן בהצלחה', 'success');
    }
    setShowModal(false);
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          data: event.target.result,
          uploadedAt: new Date().toISOString()
        };
        
        if (type === 'closing') {
          setModalData(prev => ({ ...prev, closingImage: fileData }));
        } else {
          setModalData(prev => ({
            ...prev,
            images: [...prev.images, fileData]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const handleAddPushNotification = () => {
    if (!newPushNotification.trim()) return;
    
    const notification = {
      id: Date.now(),
      message: newPushNotification.trim(),
      createdAt: new Date().toISOString(),
      sent: false
    };
    
    setPushNotifications([...pushNotifications, notification]);
    setNewPushNotification('');
    showNotification('הודעת Push נוספה', 'success');
  };

  const handleSendPushNotification = (notificationId) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = pushNotifications.find(n => n.id === notificationId);
      if (notification) {
        new Notification('RANPRO System', {
          body: notification.message
        });
        
        setPushNotifications(pushNotifications.map(n => 
          n.id === notificationId ? { ...n, sent: true } : n
        ));
        
        showNotification('הודעה נשלחה בהצלחה', 'success');
      }
    }
  };

  const getStats = () => {
    const projectDefects = currentProject 
      ? defects.filter(d => d.projectId === currentProject.id)
      : defects;
      
    return {
      total: projectDefects.length,
      open: projectDefects.filter(d => d.status === 'open').length,
      inProgress: projectDefects.filter(d => d.status === 'in_progress').length,
      closed: projectDefects.filter(d => d.status === 'closed').length,
      critical: projectDefects.filter(d => d.priority === 'critical').length
    };
  };

  const stats = getStats();

  const getStatusConfig = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getPriorityConfig = (priority) => {
    return priorityOptions.find(opt => opt.value === priority) || priorityOptions[2];
  };

  const filteredDefects = currentProject 
    ? defects.filter(d => d.projectId === currentProject.id && 
        (searchTerm === '' || 
         d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
         d.contractor.toLowerCase().includes(searchTerm.toLowerCase())))
    : [];

  return (
    <div className="w-full min-h-screen bg-gray-50" dir="rtl">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'warning' ? 'bg-yellow-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-[#C4D100] sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#C4D100] rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold text-lg">R</span>
                </div>
                <div className="mr-2">
                  <h1 className="text-lg font-bold text-gray-700">RANPRO System</h1>
                  <p className="text-xs text-gray-500">
                    {currentProject ? currentProject.name : 'בחר פרויקט'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span className="hidden sm:inline">{isOnline ? 'מקוון' : 'לא מקוון'}</span>
              </div>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMenu(false)}>
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 p-4">
            <h3 className="font-bold text-lg mb-4">תפריט</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveView('punchlist');
                  setShowMenu(false);
                }}
                className={`w-full text-right p-3 rounded-lg flex items-center justify-between ${
                  activeView === 'punchlist' ? 'bg-[#C4D100] text-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <span>רשימת ליקויים</span>
                <CheckCircle size={20} />
              </button>
              
              <button
                onClick={() => {
                  setActiveView('ncr');
                  setShowMenu(false);
                }}
                className={`w-full text-right p-3 rounded-lg flex items-center justify-between ${
                  activeView === 'ncr' ? 'bg-[#C4D100] text-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <span>טופס אי התאמה</span>
                <FileText size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="bg-white p-4 border-b">
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveView('punchlist')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeView === 'punchlist'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            רשימת ליקויים
          </button>
          <button
            onClick={() => setActiveView('ncr')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeView === 'ncr'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            טופס אי התאמה
          </button>
        </div>
      </div>

      {/* Project Selection */}
      {!currentProject && (
        <div className="p-4">
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">ברוך הבא ל-RANPRO System</h2>
            <p className="text-gray-600 mb-6">בחר פרויקט קיים או צור פרויקט חדש</p>
            
            {projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">פרויקטים קיימים</h3>
                <div className="grid gap-3">
                  {projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setCurrentProject(project);
                        setPlanImage(project.planImage);
                      }}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-right"
                    >
                      <div className="font-semibold">{project.name}</div>
                      <div className="text-sm text-gray-500">
                        נוצר: {new Date(project.createdAt).toLocaleDateString('he-IL')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-[#C4D100] text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-[#b5c200]"
            >
              צור פרויקט חדש
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentProject && (
        <div className="space-y-4">
          {/* Statistics Cards */}
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-lg text-center bg-gray-100">
                <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                <div className="text-xs text-gray-600">סה"כ ליקויים</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-red-100">
                <div className="text-2xl font-bold text-red-600">{stats.open}</div>
                <div className="text-xs text-red-800">פתוחים</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-yellow-100">
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                <div className="text-xs text-yellow-800">בטיפול</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-green-100">
                <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
                <div className="text-xs text-green-800">סגורים</div>
              </div>
              <div className="p-4 rounded-lg text-center bg-red-100 sm:col-span-1 col-span-2">
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-xs text-red-800">קריטיים</div>
              </div>
            </div>
          </div>

          {/* Punchlist View */}
          {activeView === 'punchlist' && (
            <>
              {/* Action Controls */}
              <div className="bg-white p-4 mx-4 rounded-lg shadow-sm">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setIsAddingDefect(!isAddingDefect)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isAddingDefect 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-[#C4D100] text-gray-700 hover:bg-[#b5c200]'
                    }`}
                  >
                    <PlusCircle size={18} />
                    <span>{isAddingDefect ? 'ביטול' : 'הוסף ליקוי'}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg flex-1">
                    <Search size={18} className="text-gray-600" />
                    <input
                      type="text"
                      placeholder="חיפוש..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>
                </div>
                
                {isAddingDefect && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm text-center">
                    לחץ על התוכנית להוספת ליקוי #{nextId}
                  </div>
                )}
              </div>

              {/* Plan View */}
              <div className="bg-white mx-4 rounded-lg shadow-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-700">תוכנית הפרויקט</h2>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleZoom(0.8)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <ZoomIn size={18} />
                      </button>
                      <button
                        onClick={() => handleZoom(1.2)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <ZoomOut size={18} />
                      </button>
                      <button
                        onClick={() => setViewBox({ x: 0, y: 0, w: 800, h: 600 })}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <svg
                      ref={planRef}
                      width="100%"
                      height="400"
                      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                      className={`border-2 border-gray-300 rounded-lg bg-white ${
                        isAddingDefect ? 'cursor-crosshair' : 'cursor-grab'
                      }`}
                      onClick={handleSvgClick}
                    >
                      <defs>
                        {planImage && (
                          <pattern id="bgImage" patternUnits="userSpaceOnUse" width="800" height="600">
                            <image 
                              href={planImage} 
                              x="0" 
                              y="0" 
                              width="800" 
                              height="600" 
                              opacity="0.8" 
                            />
                          </pattern>
                        )}
                      </defs>
                      
                      <rect width="800" height="600" fill={planImage ? "url(#bgImage)" : "#f8fafc"} />
                      
                      {!planImage && (
                        <g>
                          <rect x="200" y="200" width="400" height="200" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" rx="10" />
                          <text x="400" y="280" textAnchor="middle" fill="#6b7280" fontSize="18">
                            יש להעלות תוכנית בהגדרות
                          </text>
                        </g>
                      )}

                      {/* Defects */}
                      {filteredDefects.map(defect => {
                        const priorityConfig = getPriorityConfig(defect.priority);
                        const statusConfig = getStatusConfig(defect.status);
                        
                        return (
                          <g key={defect.id}>
                            <g
                              className="cursor-pointer"
                              onClick={(e) => handleDefectClick(defect, e)}
                              onMouseEnter={() => setHoveredDefect(defect.id)}
                              onMouseLeave={() => setHoveredDefect(null)}
                            >
                              <circle
                                cx={defect.x}
                                cy={defect.y - 20}
                                r="16"
                                fill={
                                  priorityConfig.color.includes('red') ? '#ef4444' : 
                                  priorityConfig.color.includes('orange') ? '#f97316' :
                                  priorityConfig.color.includes('yellow') ? '#eab308' : '#22c55e'
                                }
                                stroke="#fff"
                                strokeWidth="2"
                              />
                              
                              <line
                                x1={defect.x}
                                y1={defect.y}
                                x2={defect.x}
                                y2={defect.y - 20}
                                stroke={
                                  statusConfig.color.includes('green') ? '#22c55e' : 
                                  statusConfig.color.includes('yellow') ? '#eab308' : '#ef4444'
                                }
                                strokeWidth="3"
                              />
                              
                              <circle
                                cx={defect.x}
                                cy={defect.y}
                                r="4"
                                fill={
                                  statusConfig.color.includes('green') ? '#22c55e' : 
                                  statusConfig.color.includes('yellow') ? '#eab308' : '#ef4444'
                                }
                                stroke="#fff"
                                strokeWidth="2"
                              />
                              
                              <text
                                x={defect.x}
                                y={defect.y - 16}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                              >
                                {defect.id}
                              </text>
                              
                              {defect.images && defect.images.length > 0 && (
                                <text
                                  x={defect.x + 20}
                                  y={defect.y - 25}
                                  fontSize="10"
                                >
                                  📷{defect.images.length}
                                </text>
                              )}
                              
                              {defect.closingImage && (
                                <text
                                  x={defect.x + 20}
                                  y={defect.y - 10}
                                  fontSize="10"
                                  fill="#22c55e"
                                >
                                  ✅
                                </text>
                              )}
                            </g>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Defects List */}
              <div className="bg-white mx-4 rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-bold mb-4 text-gray-700">
                  רשימת ליקויים ({filteredDefects.length})
                </h2>
                
                <div className="space-y-3">
                  {filteredDefects.map(defect => {
                    const statusConfig = getStatusConfig(defect.status);
                    const priorityConfig = getPriorityConfig(defect.priority);
                    
                    return (
                      <div
                        key={defect.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleDefectClick(defect)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">#{defect.id}</span>
                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${priorityConfig.color}`}>
                              {priorityConfig.label}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            {defect.images && defect.images.length > 0 && (
                              <div className="flex items-center gap-1 text-blue-500">
                                <Camera size={16} />
                                <span className="text-xs">{defect.images.length}</span>
                              </div>
                            )}
                            {defect.closingImage && (
                              <div className="text-green-500" title="תמונת סגירה">
                                <CheckCircle size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-2">
                          {defect.description || 'ללא תיאור'}
                        </p>
                        
                        <div className="text-sm text-gray-500">
                          <span>מיקום: {defect.location || 'לא צוין'}</span>
                          {defect.contractor && (
                            <span className="mr-4">קבלן: {defect.contractor}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredDefects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
                      <p>לא נמצאו ליקויים</p>
                      <p className="text-sm mt-2">לחץ על "הוסף ליקוי" להתחיל</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* NCR View */}
          {activeView === 'ncr' && (
            <div className="bg-white mx-4 my-4 rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-6 text-gray-700">טופס אי התאמה</h2>
              
              <form className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">חלק א': פרטי זיהוי</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">מספר דוח</label>
                        <input
                          type="text"
                          value={ncrData.reportId}
                          onChange={(e) => setNcrData({...ncrData, reportId: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="מספר דוח אוטומטי"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">תאריך גילוי</label>
                        <input
                          type="date"
                          value={ncrData.discoveryDate}
                          onChange={(e) => setNcrData({...ncrData, discoveryDate: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">דווח על ידי</label>
                      <input
                        type="text"
                        value={ncrData.reportedBy}
                        onChange={(e) => setNcrData({...ncrData, reportedBy: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="שם העובד/ת"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">גג</label>
                        <select
                          value={ncrData.roof}
                          onChange={(e) => setNcrData({...ncrData, roof: e.target.value, area: ''})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">בחר גג</option>
                          <option value="CUB.2">CUB.2</option>
                          <option value="FAB.1">FAB.1</option>
                          <option value="FAB.2">FAB.2</option>
                          <option value="PSSS.1">PSSS.1</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">אזור</label>
                        <select
                          value={ncrData.area}
                          onChange={(e) => setNcrData({...ncrData, area: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          disabled={!ncrData.roof}
                        >
                          <option value="">
                            {ncrData.roof ? 'בחר אזור' : 'בחר קודם גג'}
                          </option>
                          {ncrData.roof && areaOptions[ncrData.roof] && areaOptions[ncrData.roof].map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">שכבה</label>
                        <select
                          value={ncrData.layer}
                          onChange={(e) => setNcrData({...ncrData, layer: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">בחר שכבה</option>
                          <option value="מצע">מצע</option>
                          <option value="מחסום אדים">מחסום אדים</option>
                          <option value="בידוד">בידוד</option>
                          <option value="דנסדק">דנסדק</option>
                          <option value="TPO">TPO</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">חלק ב': תיאור אי ההתאמה</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">סוג ליקוי</label>
                        <input
                          type="text"
                          value={ncrData.defectType}
                          onChange={(e) => setNcrData({...ncrData, defectType: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="תיאור קצר של הליקוי"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">הדרישה שלא התקיימה</label>
                        <input
                          type="text"
                          value={ncrData.requirement}
                          onChange={(e) => setNcrData({...ncrData, requirement: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="לדוגמה: מפרט, נוהל עבודה"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מפורט</label>
                      <textarea
                        value={ncrData.description}
                        onChange={(e) => setNcrData({...ncrData, description: e.target.value})}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="יש לפרט מהי הבעיה..."
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-800">האם נדרש CAPA?</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ncrData.needsCAPA}
                          onChange={(e) => setNcrData({...ncrData, needsCAPA: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {ncrData.needsCAPA && (
                      <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold border-b pb-2">חלק ג': ניתוח ותוכנית פעולה (CAPA)</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">פעולת תיקון מיידית</label>
                          <textarea
                            value={ncrData.immediateAction}
                            onChange={(e) => setNcrData({...ncrData, immediateAction: e.target.value})}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="פעולות שנועדו לטפל בבעיה..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ניתוח סיבת שורש</label>
                          <textarea
                            value={ncrData.rootCause}
                            onChange={(e) => setNcrData({...ncrData, rootCause: e.target.value})}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="ניתוח הגורמים שהובילו לבעיה..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">פעולת מנע מומלצת</label>
                          <textarea
                            value={ncrData.preventiveAction}
                            onChange={(e) => setNcrData({...ncrData, preventiveAction: e.target.value})}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="פעולות למניעת הישנות הבעיה..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Defect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">
                  {modalData.id ? `עריכת ליקוי #${modalData.id}` : 'ליקוי חדש'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">תיאור הליקוי:</label>
                  <textarea
                    value={modalData.description}
                    onChange={(e) => setModalData({...modalData, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:border-[#C4D100] focus:outline-none"
                    rows={3}
                    placeholder="תאר את הליקוי בפירוט..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">סטטוס:</label>
                    <select
                      value={modalData.status}
                      onChange={(e) => setModalData({...modalData, status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">דחיפות:</label>
                    <select
                      value={modalData.priority}
                      onChange={(e) => setModalData({...modalData, priority: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">קבלן אחראי:</label>
                    <select
                      value={modalData.contractor}
                      onChange={(e) => setModalData({...modalData, contractor: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">בחר קבלן...</option>
                      {contractors.map(contractor => (
                        <option key={contractor} value={contractor}>{contractor}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">מיקום:</label>
                    <input
                      type="text"
                      value={modalData.location}
                      onChange={(e) => setModalData({...modalData, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="אזור / חדר..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">תמונות פתיחה:</label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                      <Camera size={16} />
                      הוסף תמונות
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-600">
                      {modalData.images ? modalData.images.length : 0} תמונות נבחרו
                    </span>
                  </div>
                  
                  {modalData.images && modalData.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {modalData.images.map((img, idx) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.data}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            onClick={() => setCurrentMedia({ data: img, type: 'image' })}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <span className="text-green-600 font-bold">תמונת סגירה:</span>
                  </label>
                  <div className="flex gap-2 items-center flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
                      <Camera size={16} />
                      הוסף תמונת סגירה
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'closing')}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-600">
                      {modalData.closingImage ? 'תמונת סגירה הועלתה ✅' : 'לא הועלתה תמונת סגירה'}
                    </span>
                  </div>
                  
                  {modalData.closingImage && (
                    <div className="mt-3">
                      <div className="relative inline-block">
                        <img
                          src={modalData.closingImage.data}
                          alt="תמונת סגירה"
                          className="w-32 h-24 object-cover rounded-lg border-4 border-green-500 cursor-pointer hover:opacity-80"
                          onClick={() => setCurrentMedia({ data: modalData.closingImage, type: 'image' })}
                        />
                        <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                          <CheckCircle size={12} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-6 mt-6 border-t">
                <button
                  onClick={handleSaveDefect}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C4D100] text-gray-700 rounded-lg hover:bg-[#b5c200] font-semibold"
                >
                  <Check size={16} />
                  שמור
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-center"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media View Modal */}
      {currentMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setCurrentMedia(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setCurrentMedia(null)}
              className="absolute top-6 right-6 text-white bg-red-500 hover:bg-red-600 rounded-full p-3"
            >
              <X size={32} />
            </button>
            
            <div className="text-center">
              <img
                src={currentMedia.data.data}
                alt="צפייה בתמונה"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <p className="text-white mt-4 text-lg font-medium">{currentMedia.data.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-700">פרויקט חדש</h3>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">שם הפרויקט:</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="לדוגמה: בניין משרדים תל אביב"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  ביטול
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 bg-[#C4D100] text-gray-700 rounded-lg hover:bg-[#b5c200] font-semibold"
                >
                  צור פרויקט
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-700">הגדרות</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Management */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 border-b pb-2">ניהול פרויקטים</h4>
                  
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-bold text-gray-800">{project.name}</h5>
                            <p className="text-sm text-gray-500">
                              נוצר: {new Date(project.createdAt).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setCurrentProject(project);
                                setPlanImage(project.planImage);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              בחר
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) {
                                  setProjects(projects.filter(p => p.id !== project.id));
                                  if (currentProject && currentProject.id === project.id) {
                                    setCurrentProject(null);
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              מחק
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">תוכנית:</label>
                          <label className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded cursor-pointer text-sm">
                            {project.planImage ? 'עדכן תוכנית' : 'העלה תוכנית'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleProjectPlanUpload(e, project.id)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 border-b pb-2">הודעות דחיפה</h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPushNotification}
                        onChange={(e) => setNewPushNotification(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg"
                        placeholder="הודעה חדשה..."
                      />
                      <button
                        onClick={handleAddPushNotification}
                        className="px-4 py-2 bg-[#C4D100] text-gray-700 rounded-lg hover:bg-[#b5c200]"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {pushNotifications.map(notification => (
                        <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">{notification.message}</span>
                          <div className="flex gap-2">
                            {!notification.sent && (
                              <button
                                onClick={() => handleSendPushNotification(notification.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                              >
                                שלח
                              </button>
                            )}
                            <button
                              onClick={() => setPushNotifications(pushNotifications.filter(n => n.id !== notification.id))}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RANPROSystem;
