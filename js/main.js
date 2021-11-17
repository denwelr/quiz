
const prevBtns = document.querySelectorAll('[data-nav="prev"]');
const nextBtns = document.querySelectorAll('[data-nav="next"]');

const userAnswers = {};

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Возвр. след. карточку
const navigate = (dir, currentCard) => {
    let currentCardNumber = parseInt(currentCard.dataset.card);

    if (dir === 'prev') currentCardNumber--;
    else currentCardNumber++;

    const nextCard = document.querySelector(`[data-card="${currentCardNumber}"]`);

    currentCard.classList.add('hidden');
    nextCard.classList.remove('hidden');

    return currentCardNumber;
};

const getDataFromCard = (cardNumber) => {
    const card = document.querySelector(`[data-card="${cardNumber}"]`);
    const cardQuestion = card.querySelector('[data-question]').innerText;

    const answer = [];

    const radioButtons = card.querySelectorAll('[type="radio"');
    radioButtons.forEach(radio => {
        if (radio.checked) {
            answer.push({
                name: radio.name,
                value: radio.value,
            });
        }
    });

    const checkboxButtons = card.querySelectorAll('[type="checkbox"]');
    checkboxButtons.forEach(checkbox => {
        if (checkbox.checked) {
            answer.push({
                name: checkbox.name,
                value: checkbox.value,
            });
        }
    });

    const inputs = card.querySelectorAll('[type="text"], [type="email"], [type="number"]');
    inputs.forEach(input => {
        if (input.value.trim().length !== 0) {
            answer.push({
                name: input.name,
                value: input.value,
            });
        }
    });

    return {
        question: cardQuestion,
        answer: answer,
    };
};

const isCardFilled = cardNumber => userAnswers[cardNumber].answer.length > 0;

const isCardValidated = cardNumber => {
    const card = document.querySelector(`[data-card="${cardNumber}"]`);
    const requiredFields = card.querySelectorAll('[required]');

    const errors = [];

    requiredFields.forEach(field => {
        if (field.type === 'email') {
            if (!isValidEmail(field.value)) errors.push("Неверно введён E-mail");
        }

        if (field.type === 'checkbox') {
            if (!field.checked) errors.push("Не поставлена галочка на одном из пунктов");
        }
    });

    return errors;
};

const pushDataToAnswers = (cardNumber, data) => userAnswers[cardNumber] = data;

const updateProgressBar = cardNumber => {
    const progressEl = document.querySelector(`[data-card="${cardNumber}"]`).querySelector('.progress');

    if(!progressEl) return;

    const totalCards = document.querySelectorAll('[data-card]:not([data-validate="novalidate"])').length;
    const progress = (cardNumber / totalCards * 100).toFixed();

    progressEl.querySelector('.progress__label strong').innerText = `${progress}%`;
    progressEl.querySelector('.progress__line-bar').style.width = `${progress}%`;
};

prevBtns.forEach(btn => {
    btn.addEventListener('click', event => {
        const currentCard = event.currentTarget.closest('[data-card]');

        navigate('prev', currentCard);
    });
});

nextBtns.forEach(btn => {
    btn.addEventListener('click', event => {
        const currentCard = event.currentTarget.closest('[data-card]');
        const currentCardNumber = currentCard.dataset.card;

        if(currentCard.dataset.validate !== 'novalidate') {
            pushDataToAnswers(currentCardNumber, getDataFromCard(currentCardNumber));

            if (!isCardFilled(currentCardNumber)) 
                return alert('На карточке нет ответа');

            if (isCardValidated(currentCardNumber).length)
                return alert(isCardValidated(currentCardNumber).join("\n"));
        }
        const nextCard = navigate('next', currentCard);

        updateProgressBar(nextCard);
    });
});

document.body.addEventListener('click', event => {
    const target = event.target.closest('.radio-block');

    if (!target) return;

    target.closest('.radio-group').querySelectorAll('.radio-block').forEach(radio => {
        radio.classList.remove('radio-block--active');
    });

    target.classList.add('radio-block--active');
});

document.querySelectorAll('.checkbox-block .checkbox-block__real').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        checkbox.closest('label').classList.toggle('checkbox-block--active');
    });
});

document.querySelectorAll('[data-safe-string]').forEach(string => {
    string.textContent = string.dataset.safeString;

    string.removeAttribute('data-safe-string');
});

