export function mountCard(targetId, title) {
    const container = document.getElementById(targetId);
    if (!container) return null;

    // HTML Base de la tarjeta
    container.innerHTML = `
        <div class="card mb-2 shadow-sm">
            <div class="card-body" id="${targetId}-content">
            </div>
        </div>
    `;

    // Retornamos funciones para manipular esta tarjeta específica
    return {
        setContent: (html) => {
            document.getElementById(`${targetId}-content`).innerHTML = html;
        },
        setLoading: (isLoading = true) => {
            const el = document.getElementById(`${targetId}-content`);
            if (!el) return;
            if (isLoading) {
                el.innerHTML = `
                    <div class="d-flex justify-content-center py-3" id="${targetId}-spinner">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                `;
            } else {
                // Remove spinner if present
                const spinner = document.getElementById(`${targetId}-spinner`);
                if (spinner && spinner.parentNode) spinner.parentNode.removeChild(spinner);
            }
        },
        setSuccess: () => {
            const dot = container.querySelector('.status-dot');
            if(dot) dot.classList.replace('bg-secondary', 'bg-success');
        },
        setError: (msg) => {
            const dot = container.querySelector('.status-dot');
            if(dot) dot.classList.replace('bg-secondary', 'bg-danger');
            document.getElementById(`${targetId}-content`).innerHTML = `<p class="text-danger medium text-center fw-bold">😩 ${msg}</p>`;
        }
    };
}