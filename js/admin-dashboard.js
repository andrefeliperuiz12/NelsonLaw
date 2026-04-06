// ============================================================
// Nelson Ruiz Pinilla — Admin Dashboard Logic
// ============================================================
// CRM functionality: list, filter, search, detail, update leads
// ============================================================

(function () {
  'use strict';

  let supabase = null;
  let currentUser = null;
  let allLeads = [];
  let currentLeadId = null;

  const AREA_LABELS = {
    derecho_administrativo: 'Derecho Administrativo',
    derecho_tributario: 'Derecho Tributario',
    derecho_penal: 'Derecho Penal',
    derecho_migratorio: 'Derecho Migratorio',
    servicios_corporativos: 'Servicios Corporativos',
    tramites_legales: 'Trámites Legales',
    regularizacion_tierras: 'Regularización de Tierras',
    asuntos_inmobiliarios: 'Asuntos Inmobiliarios',
    poderes_registro_publico: 'Poderes y Registro',
    otro: 'Otra Área',
  };

  const STATUS_LABELS = {
    nuevo: 'Nuevo',
    en_revision: 'En Revisión',
    contactado: 'Contactado',
    consulta_agendada: 'Consulta Agendada',
    cerrado_ganado: 'Cerrado (Ganado)',
    cerrado_no_ganado: 'Cerrado (No Ganado)',
    archivado: 'Archivado',
  };

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('es-PA', {
      day: '2-digit', month: 'short', year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('es-PA', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatDateShort(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short' });
  }

  // --- LOAD LEADS ---
  async function loadLeads() {
    var { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading leads:', error);
      return;
    }

    allLeads = data || [];
    updateStats();
    renderLeads();
  }

  // --- STATS ---
  function updateStats() {
    var active = allLeads.filter(function (l) { return !l.is_archived; });
    var statNuevo = document.getElementById('statNuevo');
    var statRevision = document.getElementById('statRevision');
    var statContactado = document.getElementById('statContactado');
    var statAgendada = document.getElementById('statAgendada');
    var statTotal = document.getElementById('statTotal');

    if (statNuevo) statNuevo.textContent = active.filter(function (l) { return l.status === 'nuevo'; }).length;
    if (statRevision) statRevision.textContent = active.filter(function (l) { return l.status === 'en_revision'; }).length;
    if (statContactado) statContactado.textContent = active.filter(function (l) { return l.status === 'contactado'; }).length;
    if (statAgendada) statAgendada.textContent = active.filter(function (l) { return l.status === 'consulta_agendada'; }).length;
    if (statTotal) statTotal.textContent = active.length;
  }

  // --- FILTER & RENDER ---
  function getFilteredLeads() {
    var search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    var statusFilter = document.getElementById('statusFilter')?.value || '';
    var showArchived = document.getElementById('showArchived')?.checked || false;

    return allLeads.filter(function (lead) {
      // Archive filter
      if (!showArchived && lead.is_archived) return false;
      if (statusFilter === 'archivado' && !lead.is_archived) return false;

      // Status filter
      if (statusFilter && statusFilter !== 'archivado' && lead.status !== statusFilter) return false;

      // Search
      if (search) {
        var searchFields = [
          lead.full_name,
          lead.phone,
          lead.email || '',
          AREA_LABELS[lead.legal_area] || lead.legal_area,
        ].join(' ').toLowerCase();
        if (searchFields.indexOf(search) === -1) return false;
      }

      return true;
    });
  }

  function renderLeads() {
    var tbody = document.getElementById('leadsBody');
    var emptyState = document.getElementById('emptyState');
    var table = document.getElementById('leadsTable');
    if (!tbody) return;

    var filtered = getFilteredLeads();

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (table) table.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (table) table.style.display = '';
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(function (lead) {
      return '<tr data-id="' + lead.id + '" onclick="window.openLeadModal(\'' + lead.id + '\')">' +
        '<td>' + formatDateShort(lead.created_at) + '</td>' +
        '<td class="lead-name">' + escapeHtml(lead.full_name) + '</td>' +
        '<td class="lead-phone">' + escapeHtml(lead.phone) + '</td>' +
        '<td><span class="lead-area-badge">' + (AREA_LABELS[lead.legal_area] || lead.legal_area) + '</span></td>' +
        '<td><span class="lead-status-badge ' + lead.status + '">' + (STATUS_LABELS[lead.status] || lead.status) + '</span></td>' +
        '<td><button class="view-btn" onclick="event.stopPropagation(); window.openLeadModal(\'' + lead.id + '\')">Ver</button></td>' +
        '</tr>';
    }).join('');
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- MODAL ---
  window.openLeadModal = function (leadId) {
    var lead = allLeads.find(function (l) { return l.id === leadId; });
    if (!lead) return;

    currentLeadId = leadId;
    var modal = document.getElementById('leadModal');

    // Fill modal data
    document.getElementById('modalName').textContent = lead.full_name;
    document.getElementById('modalDate').textContent = 'Creado: ' + formatDate(lead.created_at);
    document.getElementById('modalPhone').textContent = lead.phone;
    document.getElementById('modalEmail').textContent = lead.email || '—';
    document.getElementById('modalArea').textContent = AREA_LABELS[lead.legal_area] || lead.legal_area;
    document.getElementById('modalSource').textContent = lead.source || 'web_form';
    document.getElementById('modalSummary').textContent = lead.case_summary;
    document.getElementById('modalStatus').value = lead.status;
    document.getElementById('modalNotes').value = lead.notes_internal || '';
    document.getElementById('modalArchived').checked = lead.is_archived;

    // Last contacted
    var lcInput = document.getElementById('modalLastContacted');
    if (lead.last_contacted_at) {
      var d = new Date(lead.last_contacted_at);
      lcInput.value = d.toISOString().slice(0, 16);
    } else {
      lcInput.value = '';
    }

    // WhatsApp link
    var phoneDigits = lead.phone.replace(/\D/g, '');
    if (!phoneDigits.startsWith('507') && phoneDigits.length <= 8) {
      phoneDigits = '507' + phoneDigits;
    }
    document.getElementById('modalPhoneWA').href = 'https://wa.me/' + phoneDigits;

    // Load audit log
    loadAuditLog(leadId);

    // Show modal
    modal.classList.add('open');
  };

  function closeModal() {
    var modal = document.getElementById('leadModal');
    modal.classList.remove('open');
    currentLeadId = null;
  }

  // --- AUDIT LOG ---
  async function loadAuditLog(leadId) {
    var auditDiv = document.getElementById('auditLog');
    if (!auditDiv) return;

    var { data, error } = await supabase
      .from('lead_audit_log')
      .select('*')
      .eq('lead_id', leadId)
      .order('changed_at', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      auditDiv.innerHTML = '<p class="audit-empty">Sin cambios registrados.</p>';
      return;
    }

    auditDiv.innerHTML = data.map(function (entry) {
      return '<div class="audit-entry">' +
        '<span class="audit-field">' + escapeHtml(entry.field_changed) + '</span>: ' +
        (entry.old_value ? '<s>' + escapeHtml(entry.old_value) + '</s> → ' : '') +
        escapeHtml(entry.new_value || '(vacío)') +
        ' <span class="audit-time">' + formatDate(entry.changed_at) + '</span>' +
        '</div>';
    }).join('');
  }

  // --- SAVE LEAD ---
  async function saveLead() {
    if (!currentLeadId) return;

    var lead = allLeads.find(function (l) { return l.id === currentLeadId; });
    if (!lead) return;

    var newStatus = document.getElementById('modalStatus').value;
    var newNotes = document.getElementById('modalNotes').value;
    var newArchived = document.getElementById('modalArchived').checked;
    var newLastContacted = document.getElementById('modalLastContacted').value || null;

    var updates = {};
    var auditEntries = [];

    // Track changes for audit
    if (newStatus !== lead.status) {
      updates.status = newStatus;
      auditEntries.push({
        lead_id: currentLeadId,
        changed_by: currentUser?.id || null,
        field_changed: 'status',
        old_value: STATUS_LABELS[lead.status] || lead.status,
        new_value: STATUS_LABELS[newStatus] || newStatus,
      });
    }

    if (newNotes !== (lead.notes_internal || '')) {
      updates.notes_internal = newNotes;
      auditEntries.push({
        lead_id: currentLeadId,
        changed_by: currentUser?.id || null,
        field_changed: 'notes_internal',
        old_value: lead.notes_internal ? '(notas previas)' : '(vacío)',
        new_value: newNotes ? '(notas actualizadas)' : '(vacío)',
      });
    }

    if (newArchived !== lead.is_archived) {
      updates.is_archived = newArchived;
      auditEntries.push({
        lead_id: currentLeadId,
        changed_by: currentUser?.id || null,
        field_changed: 'is_archived',
        old_value: lead.is_archived ? 'Sí' : 'No',
        new_value: newArchived ? 'Sí' : 'No',
      });
    }

    if (newLastContacted) {
      var lcDate = new Date(newLastContacted).toISOString();
      if (lcDate !== lead.last_contacted_at) {
        updates.last_contacted_at = lcDate;
        auditEntries.push({
          lead_id: currentLeadId,
          changed_by: currentUser?.id || null,
          field_changed: 'last_contacted_at',
          old_value: lead.last_contacted_at ? formatDate(lead.last_contacted_at) : '(nunca)',
          new_value: formatDate(lcDate),
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      closeModal();
      return;
    }

    // Save to DB
    var { error: updateError } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', currentLeadId);

    if (updateError) {
      alert('Error al guardar: ' + updateError.message);
      return;
    }

    // Save audit entries
    if (auditEntries.length > 0) {
      await supabase.from('lead_audit_log').insert(auditEntries);
    }

    // Reload and close
    await loadLeads();
    closeModal();
  }

  // --- MARK CONTACTED NOW ---
  function markContactedNow() {
    var input = document.getElementById('modalLastContacted');
    if (input) {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      input.value = now.toISOString().slice(0, 16);
    }
  }

  // --- INITIALIZE ---
  function init() {
    supabase = window.adminSupabase;
    currentUser = window.adminSession?.user || null;

    if (!supabase) {
      console.error('Supabase not initialized');
      return;
    }

    // Load leads
    loadLeads();

    // Search & filter listeners
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(renderLeads, 300);
      });
    }

    var statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', renderLeads);

    var showArchived = document.getElementById('showArchived');
    if (showArchived) showArchived.addEventListener('change', renderLeads);

    // Modal controls
    var modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    var cancelModalBtn = document.getElementById('cancelModalBtn');
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    var saveLeadBtn = document.getElementById('saveLeadBtn');
    if (saveLeadBtn) saveLeadBtn.addEventListener('click', saveLead);

    var markContactedBtn = document.getElementById('markContactedNow');
    if (markContactedBtn) markContactedBtn.addEventListener('click', markContactedNow);

    // Close modal on overlay click
    var modalOverlay = document.getElementById('leadModal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Escape key closes modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Wait for auth to be ready
  window.addEventListener('adminReady', init);
})();
