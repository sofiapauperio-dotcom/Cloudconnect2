// CloudConnect - Airtable Integration
class AirtableService {
    constructor() {
        // These would be loaded from server-side environment in production
        this.baseId = 'app2zAT9FDyCobMH'; // This will be replaced by server endpoint
        this.tableName = 'Clientes';
        this.apiUrl = '/api/airtable'; // Proxy endpoint for security
    }

    // Get all records
    async getRecords() {
        try {
            const response = await fetch(`${this.apiUrl}/records`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.records || [];
        } catch (error) {
            console.error('Erro ao buscar registros:', error);
            throw error;
        }
    }

    // Create new record
    async createRecord(fields) {
        try {
            const response = await fetch(`${this.apiUrl}/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao criar registro:', error);
            throw error;
        }
    }

    // Delete record
    async deleteRecord(recordId) {
        try {
            const response = await fetch(`${this.apiUrl}/records/${recordId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Erro ao deletar registro:', error);
            throw error;
        }
    }
}

// Main App Class
class CloudConnectApp {
    constructor() {
        this.airtableService = new AirtableService();
        this.currentRecords = [];
        this.selectedRecordId = null;
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadClients();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('clienteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadClients();
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadClients();
        });

        // Modal event listeners
        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        // Close modal when clicking outside
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.closeDeleteModal();
            }
        });
    }

    async loadClients() {
        this.showLoadingState();
        
        try {
            const records = await this.airtableService.getRecords();
            this.currentRecords = records;
            
            if (records.length === 0) {
                this.showEmptyState();
            } else {
                this.displayClients(records);
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.showErrorState();
        }
    }

    async handleFormSubmit() {
        const form = document.getElementById('clienteForm');
        const formData = new FormData(form);
        
        const fields = {
            Nome: formData.get('nome'),
            Email: formData.get('email'),
            Telefone: formData.get('telefone')
        };

        // Validação básica
        if (!fields.Nome || !fields.Email || !fields.Telefone) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Validação de email
        if (!this.isValidEmail(fields.Email)) {
            alert('Por favor, insira um email válido.');
            return;
        }

        this.setFormLoading(true);

        try {
            await this.airtableService.createRecord(fields);
            form.reset();
            this.showSuccessMessage('Cliente adicionado com sucesso!');
            this.loadClients(); // Reload the list
        } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            alert('Erro ao adicionar cliente. Tente novamente.');
        } finally {
            this.setFormLoading(false);
        }
    }

    displayClients(records) {
        const tableBody = document.getElementById('clientsTableBody');
        tableBody.innerHTML = '';

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.fields.Nome || '-'}</td>
                <td>${record.fields.Email || '-'}</td>
                <td>${record.fields.Telefone || '-'}</td>
                <td>
                    <button class="delete-btn" onclick="app.showDeleteModal('${record.id}')">
                        Excluir
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        this.hideAllStates();
        document.getElementById('clientsTable').classList.remove('hidden');
    }

    showDeleteModal(recordId) {
        this.selectedRecordId = recordId;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    closeDeleteModal() {
        this.selectedRecordId = null;
        document.getElementById('deleteModal').classList.add('hidden');
    }

    async confirmDelete() {
        if (!this.selectedRecordId) return;

        try {
            await this.airtableService.deleteRecord(this.selectedRecordId);
            this.closeDeleteModal();
            this.showSuccessMessage('Cliente excluído com sucesso!');
            this.loadClients();
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            alert('Erro ao excluir cliente. Tente novamente.');
        }
    }

    // UI State Management
    showLoadingState() {
        this.hideAllStates();
        document.getElementById('loadingState').classList.remove('hidden');
    }

    showErrorState() {
        this.hideAllStates();
        document.getElementById('errorState').classList.remove('hidden');
    }

    showEmptyState() {
        this.hideAllStates();
        document.getElementById('emptyState').classList.remove('hidden');
    }

    hideAllStates() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('clientsTable').classList.add('hidden');
    }

    setFormLoading(loading) {
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const loadingSpinner = document.getElementById('loadingSpinner');

        if (loading) {
            submitBtn.disabled = true;
            submitText.textContent = 'Adicionando...';
            loadingSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitText.textContent = 'Adicionar Cliente';
            loadingSpinner.classList.add('hidden');
        }
    }

    showSuccessMessage(message) {
        // Simple success feedback - could be enhanced with a toast notification
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1001;
            font-weight: 600;
        `;
        tempDiv.textContent = message;
        document.body.appendChild(tempDiv);

        setTimeout(() => {
            document.body.removeChild(tempDiv);
        }, 3000);
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CloudConnectApp();
});