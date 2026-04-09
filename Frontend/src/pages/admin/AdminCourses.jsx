import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import './AdminCourses.css';

const DEFAULT_COURSE = {
  title: '',
  description: '',
  instructor: '',
  level: 'Beginner',
  duration: '0 hours',
  price: 'Free',
  thumbnail: '',
  modules: []
};

const DEFAULT_MODULE = { title: '', lessons: [] };
const DEFAULT_LESSON = {
  lesson_id: '',
  title: '',
  duration: '10m',
  type: 'video',
  video_url: '',
  content: ''
};

export default function AdminCourses() {
  const { courses, refreshCourses } = useCourses();
  const { tokens } = useAuth();
  
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // ──────────────────────────────────────────────────────────────────
  //  List View Handlers
  // ──────────────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingCourse({ ...DEFAULT_COURSE });
    setView('edit');
    setError('');
  };

  const handleEdit = (course) => {
    // Inject missing fields for older DB schemas
    if (!course.modules) course.modules = [];
    setEditingCourse(JSON.parse(JSON.stringify(course))); // Deep copy
    setView('edit');
    setError('');
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course forever?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/courses/${courseId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      if (res.ok) {
        refreshCourses();
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed.');
      }
    } catch (err) {
      alert("Failed to delete course.");
    }
  };

  // ──────────────────────────────────────────────────────────────────
  //  Editor Handlers
  // ──────────────────────────────────────────────────────────────────
  const handleSaveCourse = async () => {
    setError('');
    
    if (!editingCourse.title.trim()) {
      setError("Course title is required.");
      return;
    }

    setSaving(true);
    try {
      const isUpdate = !!editingCourse.id;
      const url = `http://localhost:8000/api/courses/${isUpdate ? editingCourse.id + '/' : ''}`;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}` 
        },
        body: JSON.stringify(editingCourse)
      });
      
      const data = await res.json();
      if (data.success) {
        await refreshCourses();
        setView('list');
      } else {
        setError(data.error || 'Failed to save course.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // Modular Builder Utilities
  const updateField = (field, val) => {
    setEditingCourse(p => ({ ...p, [field]: val }));
  };

  const addModule = () => {
    setEditingCourse({
      ...editingCourse,
      modules: [...editingCourse.modules, { ...DEFAULT_MODULE, module_id: `m_${Date.now()}` }]
    });
  };

  const removeModule = (mIndex) => {
    const fresh = [...editingCourse.modules];
    fresh.splice(mIndex, 1);
    updateField('modules', fresh);
  };
  
  const updateModuleTitle = (mIndex, val) => {
    const fresh = [...editingCourse.modules];
    fresh[mIndex].title = val;
    updateField('modules', fresh);
  };

  const addLesson = (mIndex) => {
    const fresh = [...editingCourse.modules];
    fresh[mIndex].lessons.push({ 
      ...DEFAULT_LESSON, 
      lesson_id: `l_${Date.now()}_${Math.floor(Math.random()*100)}` 
    });
    updateField('modules', fresh);
  };

  const removeLesson = (mIndex, lIndex) => {
    const fresh = [...editingCourse.modules];
    fresh[mIndex].lessons.splice(lIndex, 1);
    updateField('modules', fresh);
  };

  const updateLesson = (mIndex, lIndex, field, val) => {
    const fresh = [...editingCourse.modules];
    fresh[mIndex].lessons[lIndex][field] = val;
    updateField('modules', fresh);
  };

  // ──────────────────────────────────────────────────────────────────
  //  Render: List Mode
  // ──────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="admin-courses-container animate-fade">
        <div className="admin-section-header">
          <h2>Courses Library</h2>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + Create New Course
          </button>
        </div>
        
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Price</th>
                <th>Modules</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div 
                        className="ac-thumb-mini" 
                        style={{ backgroundImage: `url(${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=150'})` }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{course.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.level}</div>
                      </div>
                    </div>
                  </td>
                  <td>{course.instructor || 'Unknown'}</td>
                  <td style={{ fontWeight: 500 }}>
                    {course.price === 'Free' ? 'Free' : `₹${course.price}`}
                  </td>
                  <td>{course.modules?.length || 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => handleEdit(course)} style={{ marginRight: '0.5rem' }}>Edit</button>
                    <button className="btn btn-sm btn-outline ac-btn-danger" onClick={() => handleDelete(course.id)}>🗑</button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                    No courses found. Start building!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  //  Render: Edit Mode
  // ──────────────────────────────────────────────────────────────────
  return (
    <div className="admin-courses-container animate-fade">
      <div className="admin-section-header">
        <h2>{editingCourse.id ? 'Edit Course' : 'Create New Course'}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setView('list')} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSaveCourse} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save & Publish'}
          </button>
        </div>
      </div>
      
      {error && <div className="ac-error-banner">{error}</div>}

      <div className="ac-editor-layout">
        {/* Left Col: Basic Info */}
        <div className="ac-form-panel">
          <h3>Course Details</h3>
          <div className="ac-field">
            <label>Course Title</label>
            <input 
              type="text" 
              value={editingCourse.title} 
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Advanced React Patterns"
            />
          </div>
          <div className="ac-field">
            <label>Tagline / Short Description</label>
            <textarea 
              rows={3}
              value={editingCourse.description} 
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="A brief overview of the course..."
            />
          </div>
          
          <div className="ac-row-2">
            <div className="ac-field">
              <label>Instructor</label>
              <input 
                type="text" 
                value={editingCourse.instructor} 
                onChange={(e) => updateField('instructor', e.target.value)}
              />
            </div>
            <div className="ac-field">
              <label>Price (Set exactly 'Free' for free courses, else numeric IDR/INR)</label>
              <input 
                type="text" 
                value={editingCourse.price} 
                onChange={(e) => updateField('price', e.target.value)}
              />
            </div>
          </div>

          <div className="ac-row-2">
            <div className="ac-field">
              <label>Level</label>
              <select value={editingCourse.level} onChange={(e) => updateField('level', e.target.value)}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advance">Advance</option>
              </select>
            </div>
            <div className="ac-field">
              <label>Total Duration</label>
              <input 
                type="text" 
                value={editingCourse.duration} 
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="e.g. 5.5 hours"
              />
            </div>
          </div>
          
          <div className="ac-field">
            <label>Thumbnail Image URL (Optional)</label>
            <input 
              type="url" 
              value={editingCourse.thumbnail} 
              onChange={(e) => updateField('thumbnail', e.target.value)}
              placeholder="https://images.unsplash.com/... (Square or Landscape)"
            />
            {editingCourse.thumbnail && (
              <img src={editingCourse.thumbnail} alt="Preview" className="ac-thumb-preview" />
            )}
          </div>
        </div>

        {/* Right Col: Curriculum Builder */}
        <div className="ac-form-panel ac-curriculum">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Curriculum Builder</h3>
            <button className="btn btn-sm btn-outline" onClick={addModule}>+ Add Module</button>
          </div>

          {editingCourse.modules.length === 0 && (
            <div className="ac-empty-curriculum">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
              <p>Your curriculum is empty.</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Construct your course syllabus by adding your first module.</p>
            </div>
          )}

          {editingCourse.modules.map((mod, mi) => (
            <div key={mi} className="ac-mod-block">
              <div className="ac-mod-header">
                <input 
                  type="text" 
                  className="ac-mod-title-input" 
                  value={mod.title} 
                  onChange={(e) => updateModuleTitle(mi, e.target.value)}
                  placeholder={`Module ${mi + 1} Title`}
                />
                <button className="ac-btn-icon" onClick={() => removeModule(mi)} title="Delete Module">🗑</button>
              </div>

              <div className="ac-lessons-list">
                {mod.lessons.map((lesson, li) => (
                  <div key={li} className="ac-lesson-card">
                    <div className="ac-lesson-header">
                      <select 
                        className="ac-les-type" 
                        value={lesson.type} 
                        onChange={(e) => updateLesson(mi, li, 'type', e.target.value)}
                      >
                        <option value="video">▶ Video</option>
                        <option value="article">📄 Article</option>
                        <option value="quiz">📝 Quiz</option>
                      </select>
                      <input 
                        type="text" 
                        className="ac-les-title"
                        value={lesson.title} 
                        onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                        placeholder="Lesson Title"
                      />
                      <input 
                        type="text" 
                        className="ac-les-dur"
                        value={lesson.duration} 
                        onChange={(e) => updateLesson(mi, li, 'duration', e.target.value)}
                        placeholder="e.g. 15m"
                      />
                      <button className="ac-btn-icon" onClick={() => removeLesson(mi, li)}>×</button>
                    </div>

                    <div className="ac-lesson-body">
                      {(lesson.type === 'video') && (
                        <div className="ac-field">
                          <label>Video URL</label>
                          <input 
                            type="text" 
                            value={lesson.video_url || ''} 
                            onChange={(e) => updateLesson(mi, li, 'video_url', e.target.value)}
                            placeholder="Direct MP4 link, YouTube URL, or Vimeo ID"
                          />
                        </div>
                      )}
                      
                      <div className="ac-field">
                        <label>Lesson Content (Rich Text)</label>
                        <ReactQuill 
                          theme="snow" 
                          value={lesson.content || ''} 
                          onChange={(content) => updateLesson(mi, li, 'content', content)}
                          style={{ background: '#fff' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button className="btn btn-sm btn-outline ac-add-lesson-btn" onClick={() => addLesson(mi)}>
                  + Add Lesson
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
