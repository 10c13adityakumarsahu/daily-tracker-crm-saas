import re
import os

path = r'c:\Users\Adity\Desktop\Daily\frontend\src\App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: Classroom Hub UI
quick_add_pattern = re.compile(r'<label style={{fontSize: \'0.75rem\', display: \'block\', marginBottom: \'0.4rem\'}}>Quick Add Subject</label>\s+<div style={{display: \'flex\', gap: \'0.5rem\'}}>\s+<input value={newSubject\.name} onChange={e => setNewSubject\({\.\.\.newSubject, name: e\.target\.value}\)} placeholder=\"Subject Name\" style={{fontSize: \'0\.8rem\', flex: 1}} />', re.DOTALL)
replacement_1 = '''<label style={{fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem'}}>Assign Course from Bank</label>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                   <select value={newSubject.id || ""} onChange={e => setNewSubject({...newSubject, id: e.target.value})} style={{fontSize: '0.8rem', flex: 1}}>
                                      <option value="">Select Course...</option>
                                      {subjects.filter(s => !s.classroom).map(s => (
                                         <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                   </select>'''

if quick_add_pattern.search(content):
    content = quick_add_pattern.sub(replacement_1, content)
    print("Quick Add UI replaced")
else:
    print("Quick Add UI pattern not found")

# Replacement 2: Instructor List Button
edit_btn_pattern = re.compile(r'<td style={{padding: \'1rem\', textAlign: \'right\', borderRadius: \'0 12px 12px 0\'}}>\s+<button className=\"btn-secondary\" style={{padding: \'0\.4rem 0\.6rem\'}}>Edit</button>', re.DOTALL)
replacement_2 = '''<td style={{padding: '1rem', textAlign: 'right', borderRadius: '0 12px 12px 0'}}>
                        <button className="btn-secondary" style={{padding: '0.4rem 0.6rem'}} onClick={() => {
                           setEditingInstructor(inst);
                           const taught = subjects.filter(s => s.instructor === inst.id).map(s => s.id);
                           setInstructorForm({ subjects: taught, custom_data: inst.custom_data || {} });
                           setShowAddInstructor(true);
                        }}>Edit</button>'''

if edit_btn_pattern.search(content):
    content = edit_btn_pattern.sub(replacement_2, content)
    print("Edit Button replaced")
else:
    print("Edit Button pattern not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
