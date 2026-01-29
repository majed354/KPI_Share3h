/**
 * مؤشرات الأداء - كلية الشريعة والأنظمة
 * JavaScript Application
 */

// ========================================
// المتغيرات العامة
// ========================================

let programsData = [];
let selectedProgram = null;
let selectedYear = null;

// ========================================
// تعريف المؤشرات
// ========================================

const INDICATORS = [
    { id: 1, name: "تقويم الطالب لجودة خبرات التعلم", unit: "درجة (1-5)", key: "experience_eval" },
    { id: 2, name: "تقييم الطالب لجودة المقررات", unit: "درجة (1-5)", key: "course_eval" },
    { id: 3, name: "معدّل التخرج بالوقت المحدد", unit: "%", key: "graduation_rate", calculated: true },
    { id: 4, name: "معدّل استبقاء طلاب السنة الأولى", unit: "%", key: "retention_rate", calculated: true },
    { id: 5, name: "مستوى أداء الطالب (اختبارات)", unit: "%", key: "student_performance" },
    { id: 6, name: "توظيف الخريجين والدراسات العليا", unit: "%", key: "employment_rate" },
    { id: 7, name: "تقويم جهات التوظيف", unit: "درجة (1-5)", key: "employer_eval" },
    { id: 8, name: "نسبة الطلاب/هيئة التدريس", unit: "نسبة", key: "student_faculty_ratio", calculated: true },
    { id: 9, name: "النسبة المئوية للنشر العلمي", unit: "%", key: "publication_pct", calculated: true },
    { id: 10, name: "معدّل البحوث/عضو هيئة تدريس", unit: "بحث", key: "research_per_faculty", calculated: true },
    { id: 11, name: "معدّل الاقتباسات/عضو هيئة تدريس", unit: "اقتباس", key: "citations_per_faculty", calculated: true },
    { id: 12, name: "نسبة النشر العلمي للطلاب", unit: "%", key: "student_publication", gradOnly: true },
    { id: 13, name: "نسبة براءات الاختراع", unit: "براءة", key: "patents", gradOnly: true },
];

const RAW_DATA_LABELS = {
    students: "عدد الطلاب المنتظمين",
    graduates: "عدد الخريجين",
    faculty_total: "إجمالي أعضاء هيئة التدريس",
    faculty_phd: "أعضاء هيئة التدريس (دكتور+)",
    faculty_male: "أعضاء هيئة التدريس الذكور",
    faculty_published: "الأعضاء الذين نشروا بحثاً",
    research_count: "عدد الأبحاث المنشورة",
    citations: "إجمالي الاقتباسات",
    sections_total: "عدد الشعب الإجمالي",
    sections_male: "عدد شعب الذكور",
    course_eval: "تقييم جودة المقررات",
    experience_eval: "تقييم خبرة البرنامج",
};

// ========================================
// تحميل البيانات
// ========================================

async function loadData() {
    try {
        const response = await fetch('data/programs.json');
        programsData = await response.json();
        console.log('تم تحميل البيانات:', programsData);
        populateProgramSelect();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // بيانات احتياطية للعرض
        programsData = [];
    }
}

// ========================================
// ملء قائمة البرامج
// ========================================

function populateProgramSelect() {
    const select = document.getElementById('program-select');
    select.innerHTML = '<option value="">-- اختر البرنامج --</option>';
    
    programsData.forEach((program, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${program.name} (${program.degree})`;
        select.appendChild(option);
    });
}

// ========================================
// ملء قائمة السنوات
// ========================================

function populateYearSelect(programIndex) {
    const select = document.getElementById('year-select');
    const program = programsData[programIndex];
    
    select.innerHTML = '<option value="">-- اختر السنة --</option>';
    
    if (program && program.years) {
        const years = Object.keys(program.years).sort();
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `سنة ${year}`;
            select.appendChild(option);
        });
        select.disabled = false;
    } else {
        select.disabled = true;
    }
}

// ========================================
// الحصول على البيانات
// ========================================

function getData(programIndex, year) {
    const program = programsData[programIndex];
    if (!program || !program.years || !program.years[year]) {
        return null;
    }
    
    const yearData = program.years[year];
    
    // البحث عن البيانات الإجمالية (All_All)
    let data = yearData["All_All"] || yearData["All_all"] || null;
    
    // إذا لم توجد، نبحث عن أي بيانات متاحة
    if (!data) {
        const keys = Object.keys(yearData);
        for (const key of keys) {
            if (key.startsWith("All_")) {
                data = yearData[key];
                break;
            }
        }
    }
    
    // إذا لا زلنا بدون بيانات، نأخذ أول مجموعة
    if (!data && Object.keys(yearData).length > 0) {
        data = yearData[Object.keys(yearData)[0]];
    }
    
    return {
        program: program,
        year: year,
        data: data
    };
}

// ========================================
// حساب المؤشرات
// ========================================

function calculateIndicators(rawData) {
    if (!rawData || !rawData.data) return {};
    
    const d = rawData.data;
    const indicators = {};
    
    // م1: تقييم خبرة البرنامج
    indicators.experience_eval = parseFloat(d.experience_eval) || null;
    
    // م2: تقييم جودة المقررات
    indicators.course_eval = parseFloat(d.course_eval) || null;
    
    // م3: معدل التخرج (غير متوفر حالياً)
    indicators.graduation_rate = null;
    
    // م4: معدل الاستبقاء (غير متوفر حالياً)
    indicators.retention_rate = null;
    
    // م5-م7: غير متوفرة
    indicators.student_performance = null;
    indicators.employment_rate = null;
    indicators.employer_eval = null;
    
    // م8: نسبة الطلاب/الأعضاء
    const students = parseFloat(d.students) || 0;
    const faculty = parseFloat(d.faculty_total) || 0;
    if (faculty > 0 && students > 0) {
        indicators.student_faculty_ratio = `1:${Math.round(students / faculty)}`;
    } else {
        indicators.student_faculty_ratio = null;
    }
    
    // م9: نسبة النشر
    const published = parseFloat(d.faculty_published) || 0;
    if (faculty > 0) {
        indicators.publication_pct = ((published / faculty) * 100).toFixed(1);
    } else {
        indicators.publication_pct = null;
    }
    
    // م10: البحوث/عضو
    const research = parseFloat(d.research_count) || 0;
    if (faculty > 0) {
        indicators.research_per_faculty = (research / faculty).toFixed(2);
    } else {
        indicators.research_per_faculty = null;
    }
    
    // م11: الاقتباسات/عضو
    const citations = parseFloat(d.citations) || 0;
    if (faculty > 0) {
        indicators.citations_per_faculty = (citations / faculty).toFixed(1);
    } else {
        indicators.citations_per_faculty = null;
    }
    
    // م12-م13: للدراسات العليا فقط
    indicators.student_publication = null;
    indicators.patents = null;
    
    return indicators;
}

// ========================================
// عرض المؤشرات
// ========================================

function displayIndicators(rawData, indicators) {
    const grid = document.getElementById('indicators-grid');
    const program = rawData.program;
    const isGrad = program.degree === 'الماجستير' || program.degree === 'دكتوراه';
    
    grid.innerHTML = '';
    
    INDICATORS.forEach(indicator => {
        // تخطي مؤشرات الدراسات العليا للبكالوريوس
        if (indicator.gradOnly && !isGrad) return;
        
        const value = indicators[indicator.key];
        const hasValue = value !== null && value !== undefined && value !== '';
        
        const card = document.createElement('div');
        card.className = `indicator-card ${hasValue ? '' : 'no-data'}`;
        card.setAttribute('data-index', indicator.id);
        
        card.innerHTML = `
            <span class="card-number">${indicator.id}</span>
            <h3 class="card-title">${indicator.name}</h3>
            <div class="card-value">${hasValue ? value : 'غير متوفر'}</div>
            <div class="card-unit">${indicator.unit}</div>
        `;
        
        grid.appendChild(card);
    });
}

// ========================================
// عرض البيانات الخام
// ========================================

function displayRawData(rawData) {
    const grid = document.getElementById('data-grid');
    const d = rawData.data || {};
    
    grid.innerHTML = '';
    
    Object.entries(RAW_DATA_LABELS).forEach(([key, label]) => {
        const value = d[key];
        const hasValue = value !== null && value !== undefined && value !== '';
        
        const item = document.createElement('div');
        item.className = 'data-item';
        
        item.innerHTML = `
            <div class="data-label">${label}</div>
            <div class="data-value ${hasValue ? '' : 'empty'}">${hasValue ? value : '—'}</div>
        `;
        
        grid.appendChild(item);
    });
}

// ========================================
// عرض معلومات البرنامج
// ========================================

function displayProgramInfo(rawData) {
    const program = rawData.program;
    
    document.getElementById('degree-badge').textContent = program.degree;
    document.getElementById('program-name').textContent = program.name;
    document.getElementById('program-year').textContent = `السنة الدراسية: ${rawData.year}`;
}

// ========================================
// عرض النتائج
// ========================================

function showResults() {
    const programIndex = document.getElementById('program-select').value;
    const year = document.getElementById('year-select').value;
    
    if (!programIndex || !year) return;
    
    const rawData = getData(parseInt(programIndex), year);
    
    if (!rawData) {
        alert('لا توجد بيانات متاحة');
        return;
    }
    
    // حساب المؤشرات
    const indicators = calculateIndicators(rawData);
    
    // عرض المعلومات
    displayProgramInfo(rawData);
    displayIndicators(rawData, indicators);
    displayRawData(rawData);
    
    // إظهار الأقسام
    document.getElementById('program-info').classList.remove('hidden');
    document.getElementById('indicators-section').classList.remove('hidden');
    document.getElementById('raw-data-section').classList.remove('hidden');
    
    // التمرير للنتائج
    document.getElementById('program-info').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// مستمعات الأحداث
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // تغيير البرنامج
    document.getElementById('program-select').addEventListener('change', (e) => {
        const index = e.target.value;
        if (index !== '') {
            populateYearSelect(parseInt(index));
        } else {
            document.getElementById('year-select').innerHTML = '<option value="">-- اختر السنة --</option>';
            document.getElementById('year-select').disabled = true;
        }
        
        // إعادة تعيين زر العرض
        document.getElementById('show-btn').disabled = true;
        
        // إخفاء النتائج
        document.getElementById('program-info').classList.add('hidden');
        document.getElementById('indicators-section').classList.add('hidden');
        document.getElementById('raw-data-section').classList.add('hidden');
    });
    
    // تغيير السنة
    document.getElementById('year-select').addEventListener('change', (e) => {
        const programSelect = document.getElementById('program-select');
        document.getElementById('show-btn').disabled = !e.target.value || !programSelect.value;
    });
    
    // زر العرض
    document.getElementById('show-btn').addEventListener('click', showResults);
});
