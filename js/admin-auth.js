// ============================================================
// Nelson Ruiz Pinilla — Admin Authentication
// ============================================================

(function () {
  'use strict';

  const config = window.ADMIN_CONFIG || {};
  let supabase = null;

  function initSupabase() {
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      console.error('Supabase configuration missing');
      return false;
    }
    supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    return true;
  }

  // Check if user is authenticated
  async function checkAuth() {
    if (!initSupabase()) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Handle login page
  async function initLoginPage() {
    if (!initSupabase()) return;

    // If already logged in, redirect to dashboard
    const session = await checkAuth();
    if (session) {
      window.location.href = '/admin/dashboard.html';
      return;
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      const loginBtn = document.getElementById('loginBtn');
      const errorDiv = document.getElementById('loginError');

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showLoginError('Por favor ingrese email y contraseña.');
        return;
      }

      // Show loading
      loginBtn.disabled = true;
      loginBtn.classList.add('loading');
      errorDiv.classList.remove('visible');

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          showLoginError('Credenciales inválidas. Verifique su email y contraseña.');
        } else if (data.session) {
          window.location.href = '/admin/dashboard.html';
        }
      } catch (err) {
        showLoginError('Error de conexión. Intente de nuevo.');
      } finally {
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
      }
    });
  }

  function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.add('visible');
    }
  }

  // Handle dashboard page - protect route
  async function initDashboardAuth() {
    if (!initSupabase()) return;

    const session = await checkAuth();
    if (!session) {
      window.location.href = '/admin/index.html';
      return;
    }

    // Show user email
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl && session.user) {
      userEmailEl.textContent = session.user.email;
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        await supabase.auth.signOut();
        window.location.href = '/admin/index.html';
      });
    }

    // Make supabase available globally for dashboard
    window.adminSupabase = supabase;
    window.adminSession = session;

    // Dispatch event to signal dashboard is ready
    window.dispatchEvent(new Event('adminReady'));
  }

  // Initialize based on page
  document.addEventListener('DOMContentLoaded', function () {
    const isLoginPage = document.body.classList.contains('login-page');
    if (isLoginPage) {
      initLoginPage();
    } else {
      initDashboardAuth();
    }
  });
})();
