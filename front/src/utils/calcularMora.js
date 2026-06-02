const COLOMBIAN_HOLIDAYS = new Set([
    // 2025
    '2025-01-01',
    '2025-01-06',
    '2025-03-24',
    '2025-04-17',
    '2025-04-18',
    '2025-05-01',
    '2025-06-02',
    '2025-06-23',
    '2025-06-30',
    '2025-07-20',
    '2025-08-07',
    '2025-08-18',
    '2025-10-13',
    '2025-11-03',
    '2025-11-17',
    '2025-12-08',
    '2025-12-25',
    // 2026
    '2026-01-01',
    '2026-01-12',
    '2026-03-23',
    '2026-04-02',
    '2026-04-03',
    '2026-05-01',
    '2026-05-18',
    '2026-06-08',
    '2026-06-15',
    '2026-06-29',
    '2026-07-20',
    '2026-08-07',
    '2026-08-17',
    '2026-10-12',
    '2026-11-02',
    '2026-11-16',
    '2026-12-08',
    '2026-12-25'
]);

export function calcularDiasMora(created_at) {
    if (!created_at) return 0;
    
    const createdDate = new Date(created_at);
    const currentDate = new Date();
    
    if (currentDate <= createdDate) {
        return 0;
    }
    
    const hours = createdDate.getHours();
    
    const isBusinessDay = (date) => {
        const day = date.getDay();
        if (day === 0 || day === 6) return false;
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;
        
        return !COLOMBIAN_HOLIDAYS.has(dateString);
    };
    
    let mora = 0;
    
    if (hours >= 8 && hours < 12) {
        if (isBusinessDay(createdDate)) {
            mora = 1;
        }
    }
    
    const start = new Date(createdDate);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(currentDate);
    end.setHours(0, 0, 0, 0);
    
    let currentLoopDate = new Date(start);
    while (currentLoopDate <= end) {
        if (isBusinessDay(currentLoopDate)) {
            if (currentLoopDate.getTime() === end.getTime()) {
                const currentHours = currentDate.getHours();
                const currentMinutes = currentDate.getMinutes();
                const currentSeconds = currentDate.getSeconds();
                const currentMillis = currentDate.getMilliseconds();
                
                const createdMinutes = createdDate.getMinutes();
                const createdSeconds = createdDate.getSeconds();
                const createdMillis = createdDate.getMilliseconds();
                
                const hasReachedTime = (currentHours > hours) || 
                    (currentHours === hours && currentMinutes > createdMinutes) ||
                    (currentHours === hours && currentMinutes === createdMinutes && currentSeconds > createdSeconds) ||
                    (currentHours === hours && currentMinutes === createdMinutes && currentSeconds === createdSeconds && currentMillis >= createdMillis);
                    
                if (hasReachedTime) {
                    mora += 1;
                }
            } else {
                mora += 1;
            }
        }
        currentLoopDate.setDate(currentLoopDate.getDate() + 1);
    }
    
    return mora;
}

export function calcularMoraPromedio(requisiciones) {
    if (!requisiciones || requisiciones.length === 0) return 0;
    
    let totalMora = 0;
    for (const req of requisiciones) {
        totalMora += calcularDiasMora(req.created_at);
    }
    
    return Math.round(totalMora / requisiciones.length);
}
