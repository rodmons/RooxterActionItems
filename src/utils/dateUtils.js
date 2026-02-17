
export function calculateDaysOpen(createdDate) {
    if (!createdDate) return 0;
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export function getTodayString() {
    return new Date().toISOString().split('T')[0];
}
