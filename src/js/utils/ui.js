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
        setSuccess: () => {
            const dot = container.querySelector('.status-dot');
            if(dot) dot.classList.replace('bg-secondary', 'bg-success');
        },
        setError: (msg) => {
            const dot = container.querySelector('.status-dot');
            if(dot) dot.classList.replace('bg-secondary', 'bg-danger');
            document.getElementById(`${targetId}-content`).innerHTML = `<p class="text-danger small">${msg}</p>`;
        }
    };
}