import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    try {
        let date = new Date(dateString);

        if (isNaN(date.getTime())) {
            date = parseISO(dateString);
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        let finalDate = date;
        
        if (diffInSeconds > 25000 && diffInSeconds < 25500) {
             finalDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        } else if (diffInSeconds < -25000 && diffInSeconds > -25500) {
             // Trường hợp ngược lại
             finalDate = new Date(date.getTime() - (7 * 60 * 60 * 1000));
        }

        if ((now - finalDate) < 0) {
            return 'Vừa xong';
        }

        return formatDistanceToNow(finalDate, { 
            addSuffix: true, 
            locale: vi 
        });
    } catch (error) {
        console.error("Lỗi format:", error);
        return 'Vừa xong';
    }
};