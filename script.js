// ==================== GESTIÓN DE EVENTOS Y CALENDARIO ====================

// Variables globales
let eventos = [];
let vistaActual = 'mes';
let fechaActual = new Date();
let eventoEnEdicion = null;

// Elementos del DOM
const calendarioGrid = document.getElementById('calendarioGrid');
const semanaGrid = document.getElementById('semanaGrid');
const diaGrid = document.getElementById('diaGrid');
const fechaActualSpan = document.getElementById('fechaActual');
const modal = document.getElementById('modalEvento');
const eventoForm = document.getElementById('eventoForm');
const filtroTipo = document.getElementById('filtroTipo');
const darkModeToggle = document.getElementById('darkModeToggle');

// ==================== INICIALIZACIÓN ====================
function init() {
    cargarEventos();
    configurarEventListeners();
    aplicarTemaGuardado();
    renderizarVista();
    verificarNotificaciones();
}

// Cargar eventos desde localStorage
function cargarEventos() {
    const guardados = localStorage.getItem('eventos');
    if (guardados) {
        eventos = JSON.parse(guardados);
    } else {
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(hoy.getDate() + 1);
        const pasado = new Date(hoy);
        pasado.setDate(hoy.getDate() + 2);

        eventos = [
            {
                id: Date.now(),
                titulo: 'Reunión de equipo',
                descripcion: 'Planificación del sprint',
                fecha: hoy.toISOString().split('T')[0],
                hora: '10:00',
                tipo: 'reunion'
            },
            {
                id: Date.now() + 1,
                titulo: 'Entregar informe',
                descripcion: 'Informe mensual de ventas',
                fecha: hoy.toISOString().split('T')[0],
                hora: '15:30',
                tipo: 'trabajo'
            },
            {
                id: Date.now() + 2,
                titulo: 'Cumpleaños de Ana',
                descripcion: 'Comprar regalo',
                fecha: manana.toISOString().split('T')[0],
                hora: '12:00',
                tipo: 'personal'
            },
            {
                id: Date.now() + 3,
                titulo: 'Dentista',
                descripcion: 'Revisión anual',
                fecha: manana.toISOString().split('T')[0],
                hora: '16:00',
                tipo: 'personal'
            },
            {
                id: Date.now() + 4,
                titulo: 'Presentación proyecto',
                descripcion: 'Presentar avances',
                fecha: pasado.toISOString().split('T')[0],
                hora: '11:00',
                tipo: 'trabajo'
            }
        ];
        guardarEventos();
    }
}

function guardarEventos() {
    localStorage.setItem('eventos', JSON.stringify(eventos));
}

function configurarEventListeners() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnHoy = document.getElementById('btnHoy');

    if (btnPrev) btnPrev.addEventListener('click', () => navegar(-1));
    if (btnNext) btnNext.addEventListener('click', () => navegar(1));
    if (btnHoy) btnHoy.addEventListener('click', irAHoy);

    const vistaBtns = document.querySelectorAll('.vista-btn');
    vistaBtns.forEach(btn => {
        btn.removeEventListener('click', manejarCambioVista);
        btn.addEventListener('click', manejarCambioVista);
    });

    const btnAgregar = document.getElementById('btnAgregarEvento');
    if (btnAgregar) btnAgregar.addEventListener('click', () => abrirModal());

    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', cerrarModal);

    if (eventoForm) eventoForm.addEventListener('submit', guardarEvento);

    const btnEliminar = document.getElementById('btnEliminarEvento');
    if (btnEliminar) {
        btnEliminar.removeEventListener('click', eliminarEvento);
        btnEliminar.addEventListener('click', eliminarEvento);
    }

    if (filtroTipo) filtroTipo.addEventListener('change', () => renderizarVista());
    if (darkModeToggle) darkModeToggle.addEventListener('change', toggleDarkMode);

    window.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
}

function manejarCambioVista(e) {
    const vista = e.currentTarget.getAttribute('data-vista');
    if (vista) cambiarVista(vista);
}

function aplicarTemaGuardado() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkModeToggle) darkModeToggle.checked = darkMode;
    if (darkMode) document.body.classList.add('dark');
}

function toggleDarkMode() {
    const isDark = darkModeToggle.checked;
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark);
}

function navegar(direccion) {
    if (vistaActual === 'mes') {
        fechaActual.setMonth(fechaActual.getMonth() + direccion);
    } else if (vistaActual === 'semana') {
        fechaActual.setDate(fechaActual.getDate() + (direccion * 7));
    } else {
        fechaActual.setDate(fechaActual.getDate() + direccion);
    }
    renderizarVista();
}

function irAHoy() {
    fechaActual = new Date();
    renderizarVista();
}

function cambiarVista(vista) {
    // Guardar la nueva vista
    vistaActual = vista;

    // Actualizar clases activas en los botones
    const vistaBtns = document.querySelectorAll('.vista-btn');
    vistaBtns.forEach(btn => {
        if (btn.getAttribute('data-vista') === vista) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Ocultar TODAS las vistas correctamente
    const vistaMes = document.getElementById('vistaMes');
    const vistaSemana = document.getElementById('vistaSemana');
    const vistaDia = document.getElementById('vistaDia');

    // Ocultar todas
    if (vistaMes) vistaMes.classList.remove('activa');
    if (vistaSemana) vistaSemana.classList.remove('activa');
    if (vistaDia) vistaDia.classList.remove('activa');

    // Mostrar solo la vista seleccionada
    if (vista === 'mes' && vistaMes) {
        vistaMes.classList.add('activa');
    } else if (vista === 'semana' && vistaSemana) {
        vistaSemana.classList.add('activa');
    } else if (vista === 'dia' && vistaDia) {
        vistaDia.classList.add('activa');
    }

    // Renderizar el contenido
    renderizarVista();
}

function renderizarVista() {
    const opciones = { month: 'long', year: 'numeric' };
    fechaActualSpan.textContent = fechaActual.toLocaleDateString('es-ES', opciones);

    if (vistaActual === 'mes') renderizarMes();
    else if (vistaActual === 'semana') renderizarSemana();
    else renderizarDia();
}

function renderizarMes() {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const inicioCalendario = new Date(primerDia);
    inicioCalendario.setDate(primerDia.getDate() - primerDia.getDay());

    let html = '<div class="calendar-day-header">D</div>' +
        '<div class="calendar-day-header">L</div>' +
        '<div class="calendar-day-header">M</div>' +
        '<div class="calendar-day-header">M</div>' +
        '<div class="calendar-day-header">J</div>' +
        '<div class="calendar-day-header">V</div>' +
        '<div class="calendar-day-header">S</div>';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
        const fechaCelda = new Date(inicioCalendario);
        fechaCelda.setDate(inicioCalendario.getDate() + i);

        const esMesActual = fechaCelda.getMonth() === mes;
        const esHoy = fechaCelda.toDateString() === hoy.toDateString();
        const fechaStr = fechaCelda.toISOString().split('T')[0];

        let eventosDia = eventos.filter(e => e.fecha === fechaStr);
        eventosDia = filtrarEventos(eventosDia);

        html += `<div class="calendar-day ${esHoy ? 'today' : ''}" data-fecha="${fechaStr}">
                    <div class="day-number" style="${!esMesActual ? 'opacity:0.3' : ''}">
                        ${fechaCelda.getDate()}
                    </div>
                    <div class="eventos-container">
                        ${eventosDia.map(e => `
                            <div class="event-card ${e.tipo}" data-id="${e.id}" data-tipo="${e.tipo}" data-fecha="${fechaStr}">
                                <strong>${e.titulo.substring(0, 15)}</strong> ${e.hora}
                            </div>
                        `).join('')}
                    </div>
                </div>`;
    }

    if (calendarioGrid) calendarioGrid.innerHTML = html;

    asignarEventosClick();
    asignarDragDrop();
    asignarClickDia();
}

function renderizarSemana() {
    const inicioSemana = new Date(fechaActual);
    inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());

    let html = '<div class="semana-view">';
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    for (let i = 0; i < 7; i++) {
        const dia = new Date(inicioSemana);
        dia.setDate(inicioSemana.getDate() + i);
        const fechaStr = dia.toISOString().split('T')[0];

        let eventosDia = eventos.filter(e => e.fecha === fechaStr);
        eventosDia = filtrarEventos(eventosDia);

        const nombreDia = diasSemana[dia.getDay()];
        const numeroDia = dia.getDate();

        html += `<div class="semana-dia" data-fecha="${fechaStr}">
                    <div class="dia-header">
                        <strong>${nombreDia}</strong><br>
                        <small>${numeroDia}</small>
                    </div>
                    <div class="eventos-container-semana">
                        ${eventosDia.map(e => `
                            <div class="event-card-semana ${e.tipo}" data-id="${e.id}" data-tipo="${e.tipo}">
                                <div class="event-hora-semana">${e.hora}</div>
                                <div class="event-titulo-semana"><strong>${e.titulo}</strong></div>
                                ${e.descripcion ? `<div class="event-desc-semana">${e.descripcion.substring(0, 40)}</div>` : ''}
                            </div>
                        `).join('')}
                        ${eventosDia.length === 0 ? '<div class="sin-eventos-semana">Sin eventos</div>' : ''}
                    </div>
                </div>`;
    }

    html += '</div>';
    if (semanaGrid) semanaGrid.innerHTML = html;

    asignarEventosClickSemana();
    asignarClickDiaSemana();
}

function renderizarDia() {
    const fechaStr = fechaActual.toISOString().split('T')[0];

    let eventosDia = eventos.filter(e => e.fecha === fechaStr);
    eventosDia = filtrarEventos(eventosDia);
    eventosDia.sort((a, b) => a.hora.localeCompare(b.hora));

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const tituloDia = fechaActual.toLocaleDateString('es-ES', opciones);

    let html = `
        <div class="dia-header-principal">
            <h3>${tituloDia.charAt(0).toUpperCase() + tituloDia.slice(1)}</h3>
            <button class="btn-agregar-dia" onclick="abrirModal(null, '${fechaStr}')">
                <i class="fas fa-plus"></i> Agregar evento
            </button>
        </div>
        <div class="eventos-container-dia">
    `;

    if (eventosDia.length === 0) {
        html += '<div class="sin-eventos">📅 No hay eventos programados para este día</div>';
    } else {
        eventosDia.forEach(e => {
            html += `
                <div class="event-card-dia ${e.tipo}" data-id="${e.id}" data-tipo="${e.tipo}">
                    <div class="event-hora-dia">${e.hora}</div>
                    <div class="event-info-dia">
                        <div class="event-titulo-dia"><strong>${e.titulo}</strong></div>
                        <div class="event-desc-dia">${e.descripcion || 'Sin descripción'}</div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';

    if (diaGrid) diaGrid.innerHTML = html;
    asignarEventosClickDia();
}

// ==================== ASIGNAR EVENTOS CLICK ====================

function asignarEventosClick() {
    const tarjetas = document.querySelectorAll('.calendar-day .event-card');
    tarjetas.forEach(tarjeta => {
        tarjeta.removeEventListener('click', manejarClickEvento);
        tarjeta.addEventListener('click', manejarClickEvento);
    });
}

function asignarEventosClickSemana() {
    const tarjetas = document.querySelectorAll('.semana-dia .event-card-semana');
    tarjetas.forEach(tarjeta => {
        tarjeta.removeEventListener('click', manejarClickEvento);
        tarjeta.addEventListener('click', manejarClickEvento);
    });
}

function asignarEventosClickDia() {
    const tarjetas = document.querySelectorAll('.dia-view .event-card-dia');
    tarjetas.forEach(tarjeta => {
        tarjeta.removeEventListener('click', manejarClickEvento);
        tarjeta.addEventListener('click', manejarClickEvento);
    });
}

function manejarClickEvento(e) {
    e.stopPropagation();
    const eventId = parseInt(this.getAttribute('data-id'));
    const evento = eventos.find(ev => ev.id === eventId);
    if (evento) {
        abrirModal(evento);
    }
}

// ==================== CLICK EN DÍAS ====================

function asignarClickDia() {
    const dias = document.querySelectorAll('.calendar-day');
    dias.forEach(dia => {
        dia.removeEventListener('click', manejarClickDia);
        dia.addEventListener('click', manejarClickDia);

        dia.removeEventListener('dragover', dragOver);
        dia.removeEventListener('drop', drop);
        dia.addEventListener('dragover', dragOver);
        dia.addEventListener('drop', drop);
    });
}

function asignarClickDiaSemana() {
    const dias = document.querySelectorAll('.semana-dia');
    dias.forEach(dia => {
        dia.removeEventListener('click', manejarClickDia);
        dia.addEventListener('click', manejarClickDia);
    });
}

function manejarClickDia(e) {
    if (e.target.classList.contains('event-card') ||
        e.target.classList.contains('event-card-semana') ||
        e.target.closest('.event-card') ||
        e.target.closest('.event-card-semana')) {
        return;
    }

    const fecha = this.getAttribute('data-fecha');
    if (fecha) {
        abrirModal(null, fecha);
    }
}

// ==================== DRAG & DROP ====================

function asignarDragDrop() {
    const eventosDrag = document.querySelectorAll('.calendar-day .event-card');
    eventosDrag.forEach(el => {
        el.setAttribute('draggable', 'true');
        el.removeEventListener('dragstart', dragStart);
        el.removeEventListener('dragend', dragEnd);
        el.addEventListener('dragstart', dragStart);
        el.addEventListener('dragend', dragEnd);
    });
}

let elementoArrastrando = null;

function dragStart(e) {
    elementoArrastrando = this;
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    this.classList.add('dragging');
}

function dragEnd(e) {
    this.classList.remove('dragging');
    elementoArrastrando = null;
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const eventId = parseInt(e.dataTransfer.getData('text/plain'));
    const nuevaFecha = this.getAttribute('data-fecha');
    const evento = eventos.find(ev => ev.id === eventId);

    if (evento && nuevaFecha) {
        evento.fecha = nuevaFecha;
        guardarEventos();
        renderizarVista();
        mostrarNotificacion(`Evento movido al ${nuevaFecha}`, 'success');
    }
}

// ==================== CRUD DE EVENTOS ====================

function abrirModal(evento = null, fechaPrefijada = null) {
    if (!modal) return;
    modal.style.display = 'block';

    if (evento) {
        // Modo edición
        document.getElementById('modalTitulo').textContent = 'Editar evento';
        document.getElementById('eventoId').value = evento.id;
        document.getElementById('eventoTitulo').value = evento.titulo;
        document.getElementById('eventoDescripcion').value = evento.descripcion || '';
        document.getElementById('eventoFecha').value = evento.fecha;
        document.getElementById('eventoHora').value = evento.hora;
        document.getElementById('eventoTipo').value = evento.tipo;

        const btnEliminar = document.getElementById('btnEliminarEvento');
        if (btnEliminar) {
            btnEliminar.style.display = 'block';
            btnEliminar.disabled = false;
        }

        eventoEnEdicion = evento;
    } else {
        // Modo nuevo
        document.getElementById('modalTitulo').textContent = 'Nuevo evento';
        document.getElementById('eventoForm').reset();
        document.getElementById('eventoId').value = '';

        if (fechaPrefijada) {
            document.getElementById('eventoFecha').value = fechaPrefijada;
            const ahora = new Date();
            const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
            document.getElementById('eventoHora').value = horaActual;
        }

        const btnEliminar = document.getElementById('btnEliminarEvento');
        if (btnEliminar) btnEliminar.style.display = 'none';

        eventoEnEdicion = null;
    }
}

function cerrarModal() {
    if (modal) modal.style.display = 'none';
    eventoEnEdicion = null;
}

function guardarEvento(e) {
    e.preventDefault();

    const titulo = document.getElementById('eventoTitulo').value.trim();
    const fecha = document.getElementById('eventoFecha').value;
    const hora = document.getElementById('eventoHora').value;
    const id = document.getElementById('eventoId').value;

    if (!titulo) {
        mostrarNotificacion('❌ El título es obligatorio', 'error');
        return;
    }
    if (!fecha) {
        mostrarNotificacion('❌ La fecha es obligatoria', 'error');
        return;
    }
    if (!hora) {
        mostrarNotificacion('❌ La hora es obligatoria', 'error');
        return;
    }

    // Validación de horario duplicado
    let eventosParaVerificar = eventos;
    if (id) {
        eventosParaVerificar = eventos.filter(ev => ev.id != id);
    }

    const eventoExistente = eventosParaVerificar.find(evento => {
        return evento.fecha === fecha && evento.hora === hora;
    });

    if (eventoExistente) {
        mostrarNotificacion(`⚠️ Ya existe "${eventoExistente.titulo}" a las ${hora}`, 'error');
        const horaInput = document.getElementById('eventoHora');
        horaInput.style.borderColor = '#dc3545';
        setTimeout(() => {
            horaInput.style.borderColor = '';
        }, 3000);
        return;
    }

    const nuevoEvento = {
        id: id ? parseInt(id) : Date.now(),
        titulo: titulo,
        descripcion: document.getElementById('eventoDescripcion').value,
        fecha: fecha,
        hora: hora,
        tipo: document.getElementById('eventoTipo').value
    };

    if (id) {
        const index = eventos.findIndex(ev => ev.id == id);
        if (index !== -1) {
            eventos[index] = nuevoEvento;
            mostrarNotificacion('✅ Evento actualizado correctamente', 'success');
        }
    } else {
        eventos.push(nuevoEvento);
        mostrarNotificacion('✅ Evento creado correctamente', 'success');
    }

    guardarEventos();
    renderizarVista();
    cerrarModal();
}

// ==================== FUNCIÓN ELIMINAR CORREGIDA ====================

function eliminarEvento() {
    // Verificar que hay un evento en edición
    if (!eventoEnEdicion) {
        mostrarNotificacion('❌ No hay evento seleccionado', 'error');
        return;
    }

    // Mostrar confirmación
    const confirmar = confirm(
        `🗑️ ELIMINAR EVENTO\n\n` +
        `¿Estás seguro de que deseas eliminar este evento?\n\n` +
        `📌 Título: ${eventoEnEdicion.titulo}\n` +
        `📅 Fecha: ${eventoEnEdicion.fecha}\n` +
        `🕐 Hora: ${eventoEnEdicion.hora}\n` +
        `🏷️ Tipo: ${eventoEnEdicion.tipo}\n\n` +
        `⚠️ Esta acción no se puede deshacer.`
    );

    if (confirmar) {
        // Eliminar el evento
        const idAEliminar = eventoEnEdicion.id;
        eventos = eventos.filter(ev => ev.id !== idAEliminar);

        // Guardar cambios
        guardarEventos();

        // Refrescar la vista
        renderizarVista();

        // Mostrar mensaje de éxito
        mostrarNotificacion(`✅ Evento "${eventoEnEdicion.titulo}" eliminado correctamente`, 'success');

        // CERRAR EL MODAL (esto es lo que faltaba)
        cerrarModal();

        // Limpiar la referencia
        eventoEnEdicion = null;
    }
}

function filtrarEventos(eventosLista) {
    if (!filtroTipo) return eventosLista;
    const tipo = filtroTipo.value;
    if (tipo === 'todos') return eventosLista;
    return eventosLista.filter(e => e.tipo === tipo);
}

// ==================== NOTIFICACIONES ====================

function verificarNotificaciones() {
    setInterval(() => {
        const hoy = new Date().toISOString().split('T')[0];
        const ahora = new Date();
        const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

        eventos.forEach(evento => {
            if (evento.fecha === hoy && evento.hora === horaActual) {
                mostrarNotificacion(`🔔 ${evento.titulo}: ${evento.descripcion || 'Recordatorio'}`, 'info');
            }
        });
    }, 30000);
}

function mostrarNotificacion(mensaje, tipo) {
    const notif = document.getElementById('notificacion');
    if (!notif) return;
    notif.textContent = mensaje;
    notif.style.display = 'block';
    notif.style.background = tipo === 'error' ? '#dc3545' : tipo === 'success' ? '#28a745' : '#17a2b8';

    setTimeout(() => {
        notif.style.display = 'none';
    }, 3000);
}

// Iniciar aplicación
init();