// Category definitions with colors for UI
export const CATEGORIES = {
    Comida: {
        name: 'Comida',
        color: '#f97316', // orange
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30'
    },
    Transporte: {
        name: 'Transporte',
        color: '#3b82f6', // blue
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30'
    },
    Alojamiento: {
        name: 'Alojamiento',
        color: '#8b5cf6', // violet
        bgColor: 'bg-violet-500/20',
        textColor: 'text-violet-400',
        borderColor: 'border-violet-500/30'
    },
    Ocio: {
        name: 'Ocio',
        color: '#10b981', // emerald
        bgColor: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30'
    },
    Otros: {
        name: 'Otros',
        color: '#6b7280', // gray
        bgColor: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/30'
    }
};

export const CATEGORY_LIST = Object.keys(CATEGORIES);

// Get category styling
export const getCategoryStyle = (categoryName) => {
    return CATEGORIES[categoryName] || CATEGORIES.Otros;
};
