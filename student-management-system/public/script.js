const API_URL = 'http://localhost:3000/api';

// Tab Switching
function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-btn[onclick="switchTab('${tab}')"]`).classList.add('active');

    if (tab === 'students') {
        document.getElementById('studentsSection').style.display = 'block';
        document.getElementById('coursesSection').style.display = 'none';
        fetchStudents();
    } else {
        document.getElementById('studentsSection').style.display = 'none';
        document.getElementById('coursesSection').style.display = 'block';
        fetchCourses();
    }
}

// Modal Helpers
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- STUDENT MANAGEMENT ---
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

async function fetchStudents() {
    const search = searchInput.value;
    const sort = sortSelect.value;
    const url = `${API_URL}/students?search=${search}&sort=${sort}`;

    try {
        const response = await fetch(url);
        const students = await response.json();
        renderStudents(students);
    } catch (error) { console.error('Error fetching students:', error); }
}

function renderStudents(students) {
    studentTableBody.innerHTML = '';
    students.forEach(student => {
        const age = new Date().getFullYear() - new Date(student.dob).getFullYear();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.email}</td>
            <td>${age}</td>
            <td>${student.phone || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editStudent(${student.id})">Edit</button>
                <button class="btn btn-primary" style="background-color: #10b981;" onclick="openEnrollmentModal(${student.id})">Enroll</button>
                <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;
        studentTableBody.appendChild(tr);
    });
}

document.getElementById('addStudentBtn').onclick = () => {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Student';
    openModal('studentModal');
};

document.getElementById('studentForm').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('studentId').value;
    const data = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/students/${id}` : `${API_URL}/students`;

        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        closeModal('studentModal');
        fetchStudents();
    } catch (error) { alert('Error saving student'); }
};

window.editStudent = async (id) => {
    const res = await fetch(`${API_URL}/students/${id}`);
    const student = await res.json();
    document.getElementById('studentId').value = student.id;
    document.getElementById('firstName').value = student.first_name;
    document.getElementById('lastName').value = student.last_name;
    document.getElementById('email').value = student.email;
    document.getElementById('dob').value = new Date(student.dob).toISOString().split('T')[0];
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('address').value = student.address || '';
    document.getElementById('modalTitle').innerText = 'Edit Student';
    openModal('studentModal');
};

window.deleteStudent = async (id) => {
    if (confirm('Delete student?')) {
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        fetchStudents();
    }
}

// --- COURSE MANAGEMENT ---
const courseTableBody = document.getElementById('courseTableBody');

async function fetchCourses() {
    const res = await fetch(`${API_URL}/courses`);
    const courses = await res.json();
    renderCourses(courses);
}

function renderCourses(courses) {
    courseTableBody.innerHTML = '';
    courses.forEach(course => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${course.id}</td>
            <td>${course.course_name}</td>
            <td>${course.course_code}</td>
            <td>${course.credits}</td>
            <td>
                <button class="btn btn-edit" onclick="editCourse(${course.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
            </td>
        `;
        courseTableBody.appendChild(tr);
    });
}

document.getElementById('addCourseBtn').onclick = () => {
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('courseModalTitle').innerText = 'Add Course';
    openModal('courseModal');
};

document.getElementById('courseForm').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('courseId').value;
    const data = {
        course_name: document.getElementById('courseName').value,
        course_code: document.getElementById('courseCode').value,
        credits: document.getElementById('courseCredits').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/courses/${id}` : `${API_URL}/courses`;
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        closeModal('courseModal');
        fetchCourses();
    } catch (error) { alert('Error saving course'); }
};

window.editCourse = async (id) => {
    const res = await fetch(`${API_URL}/courses/${id}`);
    const course = await res.json();
    document.getElementById('courseId').value = course.id;
    document.getElementById('courseName').value = course.course_name;
    document.getElementById('courseCode').value = course.course_code;
    document.getElementById('courseCredits').value = course.credits;
    document.getElementById('courseModalTitle').innerText = 'Edit Course';
    openModal('courseModal');
};

window.deleteCourse = async (id) => {
    if (confirm('Delete course?')) {
        await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' });
        fetchCourses();
    }
};

// --- ENROLLMENTS ---
window.openEnrollmentModal = async (studentId) => {
    document.getElementById('enrollStudentId').value = studentId;

    // Load Courses
    const courseRes = await fetch(`${API_URL}/courses`);
    const courses = await courseRes.json();
    const select = document.getElementById('courseSelect');
    select.innerHTML = '<option value="">Select Course</option>';
    courses.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.course_name} (${c.course_code})</option>`;
    });

    // Load Existing Enrollments
    fetchStudentEnrollments(studentId);
    openModal('enrollmentModal');
};

async function fetchStudentEnrollments(studentId) {
    const res = await fetch(`${API_URL}/enrollments/student/${studentId}`);
    const enrollments = await res.json();
    const list = document.getElementById('enrollmentList');
    list.innerHTML = '';
    enrollments.forEach(e => {
        list.innerHTML += `<li>${e.course_name} (${e.grade || 'Ongoing'})</li>`;
    });
}

document.getElementById('enrollmentForm').onsubmit = async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('enrollStudentId').value;
    const courseId = document.getElementById('courseSelect').value;

    try {
        await fetch(`${API_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, course_id: courseId })
        });
        fetchStudentEnrollments(studentId);
    } catch (error) { alert('Error enrolling student'); }
};

// Event Listeners
searchInput.addEventListener('input', fetchStudents);
sortSelect.addEventListener('change', fetchStudents);

// Initial Load
fetchStudents();
