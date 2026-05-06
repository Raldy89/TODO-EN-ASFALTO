const progressBar = document.querySelector('.scroll-progress__bar');
const backToTopButton = document.querySelector('.back-to-top');
const revealElements = document.querySelectorAll('[data-reveal]');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const linkedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const currentYear = document.getElementById('current-year');
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(scrollProgress, 100)}%`;
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle('visible', window.scrollY > 520);
  }
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);
updateScrollUI();

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

if (backToTopButton) {
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const activeId = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === activeId);
      });
    });
  },
  {
    rootMargin: '-40% 0px -45% 0px',
    threshold: 0.1,
  }
);

linkedSections.forEach((section) => sectionObserver.observe(section));

const counterElements = document.querySelectorAll('[data-counter]');
let countersStarted = false;

function animateCounter(element) {
  const targetValue = Number(element.dataset.counter || 0);
  const duration = 1400;
  const startTime = performance.now();

  function step(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(targetValue * eased);

    element.textContent = currentValue.toLocaleString('es-DO');

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const statsSection = document.querySelector('.stats');
if (statsSection && counterElements.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          counterElements.forEach(animateCounter);
          counterObserver.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  counterObserver.observe(statsSection);
}

const estimateForm = document.getElementById('estimador-form');
const tipoTrabajoInput = document.getElementById('tipo-trabajo');
const areaInput = document.getElementById('area');
const areaValue = document.getElementById('area-value');
const urgenciaInput = document.getElementById('urgencia');
const incluyeSelladoInput = document.getElementById('incluye-sellado');
const alquilerMaquinariaInput = document.getElementById('alquiler-maquinaria');
const estimateRange = document.getElementById('estimate-range');
const estimateService = document.getElementById('estimate-service');
const estimateArea = document.getElementById('estimate-area');
const estimateTime = document.getElementById('estimate-time');
const estimateExtra = document.getElementById('estimate-extra');
const hiddenEstimateInput = document.getElementById('estimacion-hidden');
const servicioInput = document.getElementById('servicio');

const estimateConfig = {
  asfaltado: {
    rate: 1450,
    label: 'Asfaltado completo',
    description: 'Una opcion pensada para superficies nuevas o reconstrucciones completas.',
    formValue: 'Asfaltado completo',
  },
  reparacion: {
    rate: 840,
    label: 'Reparacion y bacheo',
    description: 'Conviene cuando el area tiene fallas localizadas y todavia puede recuperarse.',
    formValue: 'Reparacion y bacheo',
  },
  sellado: {
    rate: 340,
    label: 'Sellado protector',
    description: 'Ideal para proteger el pavimento, mejorar su acabado y alargar su vida util.',
    formValue: 'Sellado protector',
  },
};

const urgencyLabels = {
  normal: 'Normal',
  programado: 'Proyecto programado',
  urgente: 'Urgente',
};

const urgencyFactors = {
  normal: 1,
  programado: 0.94,
  urgente: 1.18,
};

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 0,
});

function roundEstimate(value) {
  return Math.round(value / 500) * 500;
}

function updateEstimate() {
  if (!estimateForm || !tipoTrabajoInput || !areaInput || !urgenciaInput) {
    return;
  }

  const selectedType = tipoTrabajoInput.value;
  const area = Number(areaInput.value);
  const urgency = urgenciaInput.value;
  const includeSeal = Boolean(incluyeSelladoInput?.checked);
  const includeMachinery = Boolean(alquilerMaquinariaInput?.checked);
  const config = estimateConfig[selectedType];

  if (!config) {
    return;
  }

  let total = config.rate * area * (urgencyFactors[urgency] || 1);
  const extras = [];

  if (includeSeal && selectedType !== 'sellado') {
    total += area * 110;
    extras.push('Sellado protector');
  }

  if (includeMachinery) {
    total += 28000;
    extras.push('Alquiler de maquinaria');
  }

  const minEstimate = roundEstimate(total * 0.92);
  const maxEstimate = roundEstimate(total * 1.08);
  const areaLabel = `${area.toLocaleString('es-DO')} m2`;
  const timeLabel = urgencyLabels[urgency] || urgencyLabels.normal;
  const extraLabel = extras.length ? extras.join(' + ') : 'Sin extras';
  const rangeLabel = `${currencyFormatter.format(minEstimate)} - ${currencyFormatter.format(maxEstimate)}`;

  if (areaValue) {
    areaValue.textContent = areaLabel;
  }

  if (estimateRange) {
    estimateRange.textContent = rangeLabel;
  }

  if (estimateService) {
    estimateService.textContent = `${config.label}. ${config.description}`;
  }

  if (estimateArea) {
    estimateArea.textContent = areaLabel;
  }

  if (estimateTime) {
    estimateTime.textContent = timeLabel;
  }

  if (estimateExtra) {
    estimateExtra.textContent = extraLabel;
  }

  if (hiddenEstimateInput) {
    hiddenEstimateInput.value = `${rangeLabel} | ${config.label} | ${areaLabel} | ${timeLabel} | ${extraLabel}`;
  }

  if (servicioInput && !servicioInput.dataset.userSelected) {
    servicioInput.value = config.formValue;
  }
}

if (estimateForm) {
  estimateForm.addEventListener('input', updateEstimate);
  estimateForm.addEventListener('change', updateEstimate);
  updateEstimate();
}

if (servicioInput) {
  servicioInput.addEventListener('change', () => {
    if (servicioInput.value) {
      servicioInput.dataset.userSelected = 'true';
    }
  });
}

document.querySelectorAll('.card-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.interactive-card');
    const details = card?.querySelector('.card-details');
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.interactive-card').forEach((otherCard) => {
      otherCard.classList.remove('is-open');
      const otherButton = otherCard.querySelector('.card-toggle');
      const otherDetails = otherCard.querySelector('.card-details');

      if (otherButton) {
        otherButton.setAttribute('aria-expanded', 'false');
        otherButton.textContent = 'Ver detalles';
      }

      if (otherDetails) {
        otherDetails.hidden = true;
      }
    });

    if (!card || !details || isOpen) {
      return;
    }

    card.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Ocultar detalles';
    details.hidden = false;
  });
});

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach((otherButton) => {
      const otherAnswer = otherButton.nextElementSibling;
      const otherIcon = otherButton.querySelector('.faq-icon');

      otherButton.setAttribute('aria-expanded', 'false');
      if (otherAnswer) {
        otherAnswer.hidden = true;
      }
      if (otherIcon) {
        otherIcon.textContent = '+';
      }
    });

    if (isOpen) {
      return;
    }

    button.setAttribute('aria-expanded', 'true');
    if (answer) {
      answer.hidden = false;
    }
    if (icon) {
      icon.textContent = '-';
    }
  });
});

const citaForm = document.getElementById('cita-form');
const formStatus = document.getElementById('form-status');
const submitButton = document.getElementById('submit-button');
const messageInput = document.getElementById('mensaje');
const messageCount = document.getElementById('mensaje-count');
const dateInput = document.getElementById('fecha');

const formFields = citaForm
  ? Array.from(citaForm.querySelectorAll('input:not([type="hidden"]), select, textarea'))
  : [];

const storageKey = 'todo-en-asfalto-leon-form-draft';

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

if (dateInput) {
  dateInput.min = getTodayString();
}

function updateMessageCount() {
  if (!messageInput || !messageCount) {
    return;
  }

  const currentLength = messageInput.value.trim().length;
  messageCount.textContent = `${currentLength}/240`;
}

function getFieldError(input) {
  // Validación de campos obligatorios
  if (input.hasAttribute('required') && !input.value.trim()) {
    return 'Este campo es obligatorio';
  }

  // Validación de email con regex mejorado
  if (input.type === 'email' && input.value.trim()) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(input.value.trim())) {
      return 'Ingresa un correo electronico valido';
    }
    // Verificación adicional de dominios comunes
    const domain = input.value.trim().split('@')[1];
    const forbiddenDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    if (forbiddenDomains.some(fd => domain.includes(fd))) {
      return 'Usa un correo electronico permanente';
    }
  }

  // Validación de teléfono mejorada
  if (input.id === 'telefono' && input.value.trim()) {
    const phoneRegex = /^[0-9 +()-]{7,18}$/;
    if (!phoneRegex.test(input.value.trim())) {
      return 'Ingresa un numero de telefono valido';
    }
    // Validación específica para República Dominicana
    const cleanPhone = input.value.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('1') && cleanPhone.length !== 11) {
      return 'Formato de telefono estadounidense invalido';
    }
    if ((cleanPhone.startsWith('809') || cleanPhone.startsWith('829') || cleanPhone.startsWith('849')) && cleanPhone.length !== 10) {
      return 'Formato de telefono dominicano invalido';
    }
  }

  // Validación de nombre y apellido
  if ((input.id === 'nombre' || input.id === 'apellido') && input.value.trim()) {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,50}$/;
    if (!nameRegex.test(input.value.trim())) {
      return 'Solo se permiten letras, espacios y caracteres comunes';
    }
    if (input.value.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
  }

  // Validación de mensaje
  if (input.id === 'mensaje' && input.value.trim().length > 240) {
    return 'El mensaje no puede exceder los 240 caracteres';
  }
  if (input.id === 'mensaje' && input.value.trim().length > 0 && input.value.trim().length < 10) {
    return 'El mensaje debe tener al menos 10 caracteres';
  }

  // Validación de fecha
  if (input.id === 'fecha') {
    const selectedDate = new Date(input.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return 'La fecha no puede ser anterior a hoy';
    }
    // No permitir fechas demasiado lejanas (más de 1 año)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (selectedDate > maxDate) {
      return 'La fecha no puede ser superior a un año';
    }
  }

  // Validación anti-spam para el servicio
  if (input.id === 'servicio' && input.value) {
    const validServices = [
      'Asfaltado completo',
      'Reparacion y bacheo', 
      'Sellado protector',
      'Alquiler de maquinaria'
    ];
    if (!validServices.includes(input.value)) {
      return 'Selecciona una opcion valida';
    }
  }

  return '';
}

function setFieldState(input, errorMessage) {
  const wrapper = input.closest('.form-group');
  const errorElement = document.getElementById(`${input.id}-error`);

  if (wrapper) {
    wrapper.classList.toggle('is-invalid', Boolean(errorMessage));
    wrapper.classList.toggle('is-valid', !errorMessage && input.value.trim() !== '');
  }

  if (errorElement) {
    errorElement.textContent = errorMessage;
  }

  input.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');
}

function validateField(input) {
  const errorMessage = getFieldError(input);
  setFieldState(input, errorMessage);
  return !errorMessage;
}

function saveDraft() {
  if (!citaForm) {
    return;
  }

  const draft = {};
  formFields.forEach((field) => {
    draft[field.id] = field.value;
  });

  try {
    localStorage.setItem(storageKey, JSON.stringify(draft));
    if (formStatus) {
      formStatus.textContent = 'Tu informacion se ha guardado automaticamente en este navegador.';
    }
  } catch (error) {
    if (formStatus) {
      formStatus.textContent = 'No pudimos guardar el borrador automaticamente en este navegador.';
    }
  }
}

function restoreDraft() {
  if (!citaForm) {
    return;
  }

  try {
    const rawDraft = localStorage.getItem(storageKey);
    if (!rawDraft) {
      return;
    }

    const draft = JSON.parse(rawDraft);
    let restoredFields = 0;

    formFields.forEach((field) => {
      if (typeof draft[field.id] === 'string' && draft[field.id] !== '') {
        field.value = draft[field.id];
        restoredFields += 1;
      }
    });

    if (servicioInput && servicioInput.value) {
      servicioInput.dataset.userSelected = 'true';
    }

    if (restoredFields > 0 && formStatus) {
      formStatus.textContent = 'Recuperamos tu borrador para que puedas continuar.';
    }
  } catch (error) {
    if (formStatus) {
      formStatus.textContent = 'No fue posible recuperar un borrador previo.';
    }
  }
}

if (citaForm) {
  restoreDraft();
  updateMessageCount();
  formFields.forEach((field) => validateField(field));

  formFields.forEach((field) => {
    const eventName = field.tagName === 'SELECT' ? 'change' : 'input';

    field.addEventListener(eventName, () => {
      validateField(field);
      saveDraft();
      updateMessageCount();
    });

    if (eventName !== 'change') {
      field.addEventListener('blur', () => {
        validateField(field);
      });
    }
  });

  citaForm.addEventListener('submit', (event) => {
    const isFormValid = formFields.every((field) => validateField(field));

    if (!isFormValid) {
      event.preventDefault();
      if (formStatus) {
        formStatus.textContent = 'Revisa los campos marcados antes de enviar la solicitud.';
      }
      return;
    }

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      // Ignore storage cleanup failures and continue with the submission.
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }

    if (formStatus) {
      formStatus.textContent = 'Enviando solicitud...';
    }
  });
}

// Funcionalidad de la Galería
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        
        // Actualizar botón activo
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filtrar elementos
        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 10);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
  
  // Animación de contador para estadísticas
  const statNumbers = document.querySelectorAll('.stat-number[data-counter]');
  const animateCounter = (element) => {
    const target = parseInt(element.dataset.counter);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };
    
    updateCounter();
  };
  
  // Observer para animar contadores cuando sean visibles
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        animateCounter(entry.target);
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => counterObserver.observe(stat));
  
  // Efecto parallax suave para elementos destacados
  const parallaxElements = document.querySelectorAll('.hero__panel, .owner-badge');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.classList.contains('owner-badge') ? 0.5 : 0.3;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
  
  // Efecto de escritura para el título principal
  const mainTitle = document.querySelector('.site-header h1');
  if (mainTitle) {
    const text = mainTitle.textContent;
    mainTitle.textContent = '';
    mainTitle.style.opacity = '1';
    
    let index = 0;
    const typeWriter = () => {
      if (index < text.length) {
        mainTitle.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
      }
    };
    
    setTimeout(typeWriter, 500);
  }
  
  // Mejorar accesibilidad con navegación por teclado
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableContent = document.querySelectorAll(focusableElements);
  const firstFocusableElement = focusableContent[0];
  const lastFocusableElement = focusableContent[focusableContent.length - 1];
  
  // Trampas de foco para mejor accesibilidad
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  });
  
  // Animación de partículas sutiles para el fondo
  const createParticle = () => {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      pointer-events: none;
      opacity: 0.3;
      background: var(--accent);
      border-radius: 50%;
      width: 2px;
      height: 2px;
      left: ${Math.random() * window.innerWidth}px;
      top: ${window.innerHeight}px;
      z-index: 1;
    `;
    
    document.body.appendChild(particle);
    
    const duration = Math.random() * 3000 + 2000;
    const horizontalMovement = (Math.random() - 0.5) * 100;
    
    particle.animate([
      { transform: 'translateY(0) translateX(0)', opacity: 0.3 },
      { transform: `translateY(-${window.innerHeight + 100}px) translateX(${horizontalMovement}px)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  };
  
  // Crear partículas periódicamente
  setInterval(createParticle, 300);
});
