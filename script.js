document.addEventListener('DOMContentLoaded', () => {
    const habits = loadHabits();
    const completedTodaySpan = document.getElementById('completed-today');
    const totalHabitsSpan = document.getElementById('total-habits');
    const habitList = document.getElementById('habit-list');
    const noHabitsMessage = document.getElementById('no-habits-message');

    renderHabits();
    updateSummary();


    function renderHabits() {
        if (!habitList) return;
        habitList.innerHTML = '';

        if (habits.length === 0) {
            if (noHabitsMessage) noHabitsMessage.style.display = 'block';
            return;
        } else {
            if (noHabitsMessage) noHabitsMessage.style.display = 'none';
        }

        habits.forEach(habit => {
            const li = document.createElement('li');
            li.className = 'habit-item';
            li.dataset.habitId = habit.id;

            const isDoneToday = habit.completedDates && habit.completedDates.includes(getCurrentDateString());
            const checkedAttribute = isDoneToday ? 'checked' : '';

            li.innerHTML = `
                <input type="checkbox" id="habit-${habit.id}-done" class="habit-checkbox" data-habit-id="${habit.id}" ${checkedAttribute}>
                <label for="habit-${habit.id}-done">${habit.name}</label>
                <span class="habit-streak">Серия: ${getHabitStreak(habit)} дней</span>
                <div class="habit-actions">
                    <button class="edit-btn" data-habit-id="${habit.id}" title="Редактировать">Изменить</button>
                    <button class="delete-btn" data-habit-id="${habit.id}" title="Удалить">Отмена</button>
                </div>
            `;
            habitList.appendChild(li);
        });
    }

    function updateSummary() {
        if (!completedTodaySpan || !totalHabitsSpan) return;

        let completedCount = 0;
        const todayStr = getCurrentDateString();
        habits.forEach(habit => {
            if (habit.completedDates && habit.completedDates.includes(todayStr)) {
                completedCount++;
            }
        });
        completedTodaySpan.textContent = completedCount;
        totalHabitsSpan.textContent = habits.length;
    }

    function handleCheckboxClick(event) {
        const checkbox = event.target;
        const habitId = parseInt(checkbox.dataset.habitId);
        const todayStr = getCurrentDateString();

        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        if (checkbox.checked) {
            if (!habit.completedDates) {
                habit.completedDates = [];
            }
            if (!habit.completedDates.includes(todayStr)) {
                habit.completedDates.push(todayStr);
            }
        } else {
            if (habit.completedDates) {
                habit.completedDates = habit.completedDates.filter(date => date !== todayStr);
            }
        }
        saveHabits();
        updateSummary();
        updateStreakDisplay(habitId);
    }

    function updateStreakDisplay(habitId) {
        const habitElement = document.querySelector(`.habit-item[data-habit-id="${habitId}"]`);
        if (!habitElement) return;
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;
        const streakSpan = habitElement.querySelector('.habit-streak');
        if (streakSpan) {
            streakSpan.textContent = `Серия: ${getHabitStreak(habit)} дней`;
        }
    }



    const addHabitForm = document.getElementById('add-habit-form');
    if (addHabitForm) {
        addHabitForm.addEventListener('submit', handleAddHabitFormSubmit);
    }

    function handleAddHabitFormSubmit(event) {
        event.preventDefault();

        const nameInput = document.getElementById('habit-name');
        const descriptionInput = document.getElementById('habit-description');
        const dailyCheckbox = document.getElementById('habit-daily');
        const dayCheckboxes = addHabitForm.querySelectorAll('input[name="habit-days"]:checked');
        const goalInput = document.getElementById('habit-goal');
        const colorInput = document.getElementById('habit-color');

        const newHabit = {
            id: Date.now(),
            name: nameInput.value.trim(),
            description: descriptionInput.value.trim(),
            frequency: dailyCheckbox.checked ? 'daily' : 'custom',
            days: Array.from(dayCheckboxes).map(cb => cb.value),
            goal: goalInput.value ? parseInt(goalInput.value) : null,
            color: colorInput.value,
            completedDates: []
        };

        if (!newHabit.name) {
            alert('Название привычки обязательно');
            return;
        }

        habits.push(newHabit);
        saveHabits();
        alert('Привычка успешно добавлена');
        addHabitForm.reset();
        window.location.href = 'start.html';
    }

    function renderStatistics() {
        console.log("Rendering Statistics...");
    }

    function getCurrentDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getHabitStreak(habit) {
        if (!habit.completedDates || habit.completedDates.length === 0) {
            return 0;
        }

        const todayStr = getCurrentDateString();
        let streak = 0;
        let currentDate = new Date(todayStr);

        if (!habit.completedDates.includes(todayStr)) {
            return 0;
        }

        for (let i = 0; i < habit.completedDates.length; i++) {
            const completedDateStr = habit.completedDates[habit.completedDates.length - 1 - i];
            const completedDate = new Date(completedDateStr);

            const diffDays = Math.floor((new Date(todayStr) - completedDate) / (1000 * 60 * 60 * 24));

            if (diffDays === i) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }


    function loadHabits() {
        const storedHabits = localStorage.getItem('habitsTracker');
        return storedHabits ? JSON.parse(storedHabits) : [];
    }

    function saveHabits() {
        localStorage.setItem('habitsTracker', JSON.stringify(habits));
    }

    if (habitList) {
        habitList.addEventListener('change', (event) => {
            if (event.target.classList.contains('habit-checkbox')) {
                handleCheckboxClick(event);
            }
        });
    }

    if (habitList) {
        habitList.addEventListener('click', (event) => {
            const target = event.target;
            const habitId = parseInt(target.dataset.habitId);

            if (target.classList.contains('delete-btn')) {
                if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
                    deleteHabit(habitId);
                }
            } else if (target.classList.contains('edit-btn')) {
                editHabit(habitId);
            }
        });
    }

    function deleteHabit(id) {
        const start = habits.findstart(h => h.id === id);
        if (start > -1) {
            habits.splice(start, 1);
            saveHabits();
            renderHabits();
            updateSummary();
            renderStatistics();
        }
    }


    if (window.location.pathname.includes('Statistics.html')) {
         renderStatistics();
    }

});