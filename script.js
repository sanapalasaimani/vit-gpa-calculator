document.addEventListener('DOMContentLoaded', function() {
    const subjectsContainer = document.getElementById('subjectsContainer');
    const addSubjectBtn = document.getElementById('addSubject');
    const calculateSGPA = document.getElementById('calculateSGPA');
    const sgpaValue = document.getElementById('sgpaValue');
    const calculateCGPA = document.getElementById('calculateCGPA');
    const cgpaValue = document.getElementById('cgpaValue');
    const prevCGPA = document.getElementById('prevCGPA');
    const prevCredits = document.getElementById('prevCredits');
    const currSGPA = document.getElementById('currSGPA');
    const currCredits = document.getElementById('currCredits');
    const resetBtn = document.getElementById('resetDefault');
    const motivationBox = document.getElementById('motivationBox');

    const gradePoints = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 };

    // Remove any existing error messages
    function removeExistingErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    // Show error message
    function showError(element, message) {
        removeExistingErrors();
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        element.parentNode.insertBefore(error, element.nextSibling);
        setTimeout(() => error.remove(), 3000);
    }

    // Input validation functions
    function validateNumberInput(value, min, max, fieldName) {
        if (value === '' || value === null || value === undefined) {
            return { valid: false, message: `${fieldName} cannot be empty` };
        }
        const num = parseFloat(value);
        if (isNaN(num)) {
            return { valid: false, message: `${fieldName} must be a valid number` };
        }
        if (num < min) {
            return { valid: false, message: `${fieldName} cannot be less than ${min}` };
        }
        if (num > max) {
            return { valid: false, message: `${fieldName} cannot be greater than ${max}` };
        }
        return { valid: true, value: num };
    }
    function restrictCGPAInput(el) {
        el.addEventListener('input', function() {
            let val = this.value;
            if (val === '') return;
            
            // Allow only numbers and decimal point
            val = val.replace(/[^\d.]/g, '');
            
            // Prevent multiple decimal points
            const parts = val.split('.');
            if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Limit decimal places
            if (parts[1] && parts[1].length > 2) {
                val = parts[0] + '.' + parts[1].substring(0, 2);
            }
            
            this.value = val;
            
            const num = parseFloat(val);
            if (!isNaN(num)) {
                if (num > 10) this.value = '10';
                if (num < 0) this.value = '0';
            }
        });
    }

    restrictCGPAInput(prevCGPA);
    restrictCGPAInput(currSGPA);

    prevCredits.addEventListener('input', function() {
        let val = this.value.replace(/[^\d]/g, '');
        this.value = val;
        const num = parseInt(val);
        if (!isNaN(num) && num < 0) this.value = '0';
    });

    function createSubjectRow(name = '', credit = '4', grade = 'S') {
        const row = document.createElement('div');
        row.className = 'subject-row';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'subject-name';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = name;
        input.readOnly = true;
        input.placeholder = 'Subject name';
        nameDiv.appendChild(input);

        const credDiv = document.createElement('div');
        credDiv.className = 'credit-select';
        const credSelect = document.createElement('select');
        [4, 3, 2, 1].forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c + ' credit' + (c > 1 ? 's' : '');
            if (c == credit) opt.selected = true;
            credSelect.appendChild(opt);
        });
        credDiv.appendChild(credSelect);

        const gradeDiv = document.createElement('div');
        gradeDiv.className = 'grade-select';
        const gradeSelect = document.createElement('select');
        Object.keys(gradePoints).forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g + ' (' + gradePoints[g] + ' points)';
            if (g === grade) opt.selected = true;
            gradeSelect.appendChild(opt);
        });
        gradeDiv.appendChild(gradeSelect);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-subject';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            if (document.querySelectorAll('.subject-row').length > 1) {
                row.remove();
                sgpaValue.textContent = '—';
                currSGPA.value = '';
                currCredits.value = '';
                cgpaValue.textContent = '—';
                motivationBox.style.display = 'none';
            } else {
                showError(removeBtn, 'At least one subject is required');
            }
        };

        row.append(nameDiv, credDiv, gradeDiv, removeBtn);
        return row;
    }

    function loadDefaultSlots() {
        subjectsContainer.innerHTML = '';
        const defaults = [
            ['Slot-A', 4, 'S'], ['Slot-B', 3, 'A'], ['Slot-C', 4, 'B'],
            ['Slot-D', 3, 'A'], ['Slot-E', 2, 'S'], ['Slot-F', 1, 'B']
        ];
        defaults.forEach(([n, c, g]) => subjectsContainer.appendChild(createSubjectRow(n, c, g)));
        sgpaValue.textContent = '—';
        currSGPA.value = '';
        currCredits.value = '';
        cgpaValue.textContent = '—';
        motivationBox.style.display = 'none';
    }

    loadDefaultSlots();

    addSubjectBtn.onclick = () => {
        const num = document.querySelectorAll('.subject-row').length + 1;
        subjectsContainer.appendChild(createSubjectRow(`Slot-${String.fromCharCode(64 + num)}`, '3', 'S'));
        sgpaValue.textContent = '—';
        currSGPA.value = '';
        currCredits.value = '';
        cgpaValue.textContent = '—';
        motivationBox.style.display = 'none';
    };


    function calculateSGPAFunction() {
        removeExistingErrors();
        
        let totalCred = 0;
        let totalPt = 0;
        let hasValidSubjects = false;

        document.querySelectorAll('.subject-row').forEach(row => {
            const cred = parseInt(row.querySelector('.credit-select select').value) || 0;
            const grade = row.querySelector('.grade-select select').value;
            const gp = gradePoints[grade] ?? 0;
            
            if (cred > 0) {
                hasValidSubjects = true;
                totalCred += cred;
                totalPt += cred * gp;
            }
        });

        if (!hasValidSubjects) {
            showError(calculateSGPA, 'No valid subjects with credits found');
            return;
        }

        if (totalCred > 0) {
            const sgpa = (totalPt / totalCred).toFixed(2);
            if (sgpa > 10) {
                showError(calculateSGPA, 'Calculated SGPA exceeds maximum (10)');
                return;
            }
            
            sgpaValue.textContent = sgpa;
            currSGPA.value = sgpa;
            currCredits.value = totalCred;
            
            // Add animation
            document.getElementById('sgpaDisplay').classList.add('calculated');
            setTimeout(() => document.getElementById('sgpaDisplay').classList.remove('calculated'), 500);
        }
    }

    // SGPA calculation on button click
    calculateSGPA.onclick = calculateSGPAFunction;

    // Enter key for SGPA
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
            e.preventDefault();
            calculateSGPAFunction();
        }
    });

    // Calculate CGPA only when button is clicked or Enter pressed on CGPA button
    function calculateCGPAFunction() {
        removeExistingErrors();

        // Validate inputs
        const prevCGPAVal = validateNumberInput(prevCGPA.value, 0, 10, 'Previous CGPA');
        const prevCreditsVal = validateNumberInput(prevCredits.value, 0, Infinity, 'Previous Credits');
        const currSGPAVal = validateNumberInput(currSGPA.value, 0, 10, 'Current SGPA');
        const currCreditsVal = validateNumberInput(currCredits.value, 0, Infinity, 'Current Credits');

        // Check each validation
        if (!prevCGPAVal.valid) {
            showError(prevCGPA, prevCGPAVal.message);
            return;
        }
        if (!prevCreditsVal.valid) {
            showError(prevCredits, prevCreditsVal.message);
            return;
        }
        if (!currSGPAVal.valid) {
            showError(currSGPA, currSGPAVal.message);
            return;
        }
        if (!currCreditsVal.valid) {
            showError(currCredits, currCreditsVal.message);
            return;
        }

        const pCG = prevCGPAVal.value;
        const pCred = prevCreditsVal.value;
        const cSG = currSGPAVal.value;
        const cCred = currCreditsVal.value;

        // Additional business logic validation
        if (cCred === 0) {
            showError(currCredits, 'Current semester credits cannot be zero');
            return;
        }

        if (pCred === 0 && pCG > 0) {
            showError(prevCredits, 'Previous credits cannot be zero when previous CGPA is entered');
            return;
        }

        let newCG;
        if (pCred <= 0) {
            newCG = cSG;
        } else {
            newCG = ((pCG * pCred) + (cSG * cCred)) / (pCred + cCred);
        }

        // Ensure final CGPA is within valid range
        newCG = Math.min(10, Math.max(0, newCG));
        
        cgpaValue.textContent = newCG.toFixed(2);
        
        // Add animation
        document.getElementById('cgpaDisplay').classList.add('calculated');
        setTimeout(() => document.getElementById('cgpaDisplay').classList.remove('calculated'), 500);
        
        showMotivation(newCG);
    }

    calculateCGPA.onclick = calculateCGPAFunction;

    // Enter key for CGPA calculation when CGPA button is focused or no specific input
    calculateCGPA.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateCGPAFunction();
        }
    });

    function showMotivation(cgpa) {
        motivationBox.innerHTML = '';
        motivationBox.className = 'motivation-box';
        motivationBox.style.display = 'block';

        if (cgpa >= 9.5) {
            motivationBox.classList.add('celebration');
            motivationBox.innerHTML = `🏆🎓 EXCEPTIONAL! CGPA ${cgpa.toFixed(2)} 🎓🏆<br>"Excellence is not an act, but a habit." - You've made it a habit!`;
        } else if (cgpa >= 9) {
            motivationBox.classList.add('celebration');
            motivationBox.innerHTML = `🎉 Outstanding result! CGPA ${cgpa.toFixed(2)} 🎉<br>"Great things never come from comfort zone." Keep pushing boundaries!`;
        } else if (cgpa >= 8) {
            motivationBox.innerHTML = `🌟 Excellent performance — CGPA ${cgpa.toFixed(2)} 🌟<br>"The expert in anything was once a beginner." You're on the right track!`;
        } else if (cgpa >= 7) {
            motivationBox.innerHTML = `💪 Solid performance — CGPA ${cgpa.toFixed(2)}<br>"Success is the sum of small efforts, repeated day in and day out." Keep going!`;
        } else if (cgpa >= 6) {
            motivationBox.innerHTML = `📚 Good effort — CGPA ${cgpa.toFixed(2)}<br>"It does not matter how slowly you go as long as you do not stop." - Confucius`;
        } else {
            motivationBox.innerHTML = `🌱 CGPA ${cgpa.toFixed(2)} — Every expert was once a beginner.<br>"The best view comes after the hardest climb." Better days are ahead!`;
        }
    }

    resetBtn.onclick = () => {
        loadDefaultSlots();
        prevCGPA.value = '';
        prevCredits.value = '';
        sgpaValue.textContent = '—';
        currSGPA.value = '';
        currCredits.value = '';
        cgpaValue.textContent = '—';
        motivationBox.style.display = 'none';
        removeExistingErrors();
    };

    // White Box Testing: Verify internal calculations
    console.log('White Box Testing:');
    console.log('1. Grade Points Mapping:', gradePoints);
    console.log('2. Default Subjects Loaded:', document.querySelectorAll('.subject-row').length);
    console.log('3. Event Listeners Attached:', {
        addSubject: !!addSubjectBtn.onclick,
        calculateSGPA: !!calculateSGPA.onclick,
        calculateCGPA: !!calculateCGPA.onclick,
        reset: !!resetBtn.onclick
    });

    // Black Box Testing Helper
    window.testCalculator = function() {
        console.log('\nBlack Box Test Cases:');
        console.log('Test 1: Empty inputs - Should show errors');
        console.log('Test 2: Invalid values (negative, >10) - Should be restricted');
        console.log('Test 3: Boundary values (0, 10) - Should calculate correctly');
        console.log('Test 4: Decimal precision - Should show 2 decimal places');
        console.log('Test 5: Remove subjects - Should update totals');
        console.log('Test 6: Add subjects - Should create new rows');
        console.log('Test 7: Reset button - Should clear all fields');
        console.log('Test 8: Enter key - Should trigger calculations');
    };
    
    window.testCalculator();
});