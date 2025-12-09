import client from './client';

export interface SupportTicketData {
    subject: string;
    message: string;
    contact_email?: string; // Теперь можно передать email
    file: File | null;
}

export const sendSupportTicket = async (data: SupportTicketData) => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    if (data.contact_email) {
        formData.append('contact_email', data.contact_email);
    }
    if (data.file) {
        formData.append('file', data.file);
    }

    const response = await client.post('/support/tickets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};