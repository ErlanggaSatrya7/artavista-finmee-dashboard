// types.ts
export interface ISalesData {
    id: string;
    title: string;
    status: string;
    date: string;
    platform: string;   // nama pelanggan
    amount?: string;    // nilai proyek (Rp)
}

export interface IProductData {
    id: string;
    name: string;
    category: string;
    price: string;
    sold: string;
    imageUrl: string;
    description?: string;
}

export interface ICustomerData {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone?: string;
    spent: string;
    status: string;
}

export interface IScheduleData {
    id: string;
    title: string;
    clientName: string;
    startDate: string;
    deadline: string;
    progress: number;   // 0-100
    status: string;     // 'Belum Mulai' | 'Proses' | 'Selesai' | 'Revisi'
    pic: string;
    notes: string;
}

export interface ISharedViewProps {
    navigate: (menu: string) => void;
    onAction: (actionName: string, recordId?: string) => void;
    userRole?: string;
}