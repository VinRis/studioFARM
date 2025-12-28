// Form Handling and Validation
class FarmForms {
    constructor() {
        this.forms = new Map();
        this.currentForm = null;
    }

    // Initialize all forms
    initForms() {
        this.setupProductionForm();
        this.setupFinancialForm();
        this.setupHealthForm();
        this.setupSettingsForm();
    }

    // Production Form
    setupProductionForm() {
        const form = document.getElementById('production-form');
        if (!form) return;

        this.forms.set('production', form);

        // Set default date to today
        const dateInput = form.querySelector('#prod-date');
        if (dateInput && !dateInput.value) {
            dateInput.valueAsDate = new Date();
        }

        // Type change handler
        const typeSelect = form.querySelector('#prod-type');
        const unitSelect = form.querySelector('#prod-unit');
        
        if (typeSelect && unitSelect) {
            typeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'milk') {
                    unitSelect.innerHTML = `
                        <option value="liters">Liters</option>
                        <option value="gallons">Gallons</option>
                    `;
                } else if (e.target.value === 'eggs') {
                    unitSelect.innerHTML = `
                        <option value="eggs">Eggs</option>
                        <option value="trays">Trays</option>
                        <option value="crates">Crates</option>
                    `;
                }
            });
        }

        // Validation
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.validateProductionForm()) {
                const formData = this.getProductionFormData();
                
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Saving...';
                submitBtn.disabled = true;
                
                try {
                    // Save to database
                    await db.addProductionRecord(formData);
                    
                    // Close modal
                    const modal = form.closest('.modal');
                    if (modal) {
                        modal.classList.remove('active');
                    }
                    
                    // Reset form
                    form.reset();
                    
                    // Show success message
                    ui.showNotification('Production record saved successfully!', 'success');
                    
                    // Refresh dashboard if needed
                    if (window.app?.currentPage === 'dashboard') {
                        window.app.loadDashboardData();
                    }
                    
                } catch (error) {
                    console.error('Error saving production record:', error);
                    ui.showNotification('Error saving record', 'error');
                } finally {
                    // Restore button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    validateProductionForm() {
        const form = document.getElementById('production-form');
        if (!form) return false;

        const date = form.querySelector('#prod-date').value;
        const type = form.querySelector('#prod-type').value;
        const quantity = form.querySelector('#prod-quantity').value;

        // Date validation
        if (!date) {
            this.showFieldError('prod-date', 'Please select a date');
            return false;
        }

        // Quantity validation
        if (!quantity || parseFloat(quantity) <= 0) {
            this.showFieldError('prod-quantity', 'Please enter a valid quantity');
            return false;
        }

        return true;
    }

    getProductionFormData() {
        const form = document.getElementById('production-form');
        return {
            date: form.querySelector('#prod-date').value,
            type: form.querySelector('#prod-type').value,
            quantity: parseFloat(form.querySelector('#prod-quantity').value),
            unit: form.querySelector('#prod-unit').value,
            notes: form.querySelector('#prod-notes').value,
            livestock: window.app?.currentLivestock || 'dairy',
            createdAt: new Date().toISOString(),
            synced: false
        };
    }

    // Financial Form
    setupFinancialForm() {
        // This would be similar to setupProductionForm
        // Implementation for financial form modal
    }

    validateFinancialForm() {
        // Implementation for financial form validation
        return true;
    }

    getFinancialFormData() {
        // Implementation for getting financial form data
        return {};
    }

    // Health Form
    setupHealthForm() {
        // Implementation for health form modal
    }

    validateHealthForm() {
        // Implementation for health form validation
        return true;
    }

    getHealthFormData() {
        // Implementation for getting health form data
        return {};
    }

    // Settings Form
    setupSettingsForm() {
        const form = document.querySelector('.settings-form');
        if (!form) return;

        const saveBtn = form.querySelector('#save-settings');
        if (!saveBtn) return;

        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const farmName = document.getElementById('farm-name').value;
            const farmManager = document.getElementById('farm-manager').value;
            const farmLocation = document.getElementById('farm-location').value;
            const currency = document.getElementById('currency-select').value;

            // Save to localStorage
            localStorage.setItem('farmName', farmName);
            localStorage.setItem('farmManager', farmManager);
            localStorage.setItem('farmLocation', farmLocation);
            localStorage.setItem('currency', currency);

            // Save to IndexedDB
            await db.setSettings('farmName', farmName);
            await db.setSettings('farmManager', farmManager);
            await db.setSettings('farmLocation', farmLocation);
            await db.setSettings('currency', currency);

            // Sync to cloud if logged in
            if (auth.getCurrentUser()) {
                await sync.syncSettings();
            }

            ui.showNotification('Settings saved successfully!', 'success');
        });
    }

    // Form Utilities
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Remove existing error
        this.removeFieldError(fieldId);

        // Add error class
        field.classList.add('error');

        // Create error message element
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.style.color = '#F44336';
        errorEl.style.fontSize = '0.85rem';
        errorEl.style.marginTop = '0.25rem';

        field.parentNode.appendChild(errorEl);

        // Focus on field
        field.focus();

        // Auto-remove error after 5 seconds
        setTimeout(() => {
            this.removeFieldError(fieldId);
        }, 5000);
    }

    removeFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('error');

        const errorEl = field.parentNode.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            // Clear all errors
            form.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
            });
            
            form.querySelectorAll('.field-error').forEach(el => {
                el.remove();
            });
        }
    }

    populateForm(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`) || 
                         form.querySelector(`#${key}`);
            
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else if (input.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = data[key];
                }
            }
        });
    }

    // Form generation for dynamic forms
    generateForm(config) {
        const { fields, title, onSubmit } = config;
        
        let formHTML = `
            <div class="form-container">
                <h3>${title}</h3>
                <form id="dynamic-form">
        `;

        fields.forEach(field => {
            formHTML += this.generateFieldHTML(field);
        });

        formHTML += `
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Save</button>
                        <button type="button" class="btn-secondary cancel-form">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        return formHTML;
    }

    generateFieldHTML(field) {
        const { type, id, label, required, options, value, placeholder } = field;
        
        let fieldHTML = `
            <div class="form-group">
                <label for="${id}">${label}${required ? ' *' : ''}</label>
        `;

        switch(type) {
            case 'text':
            case 'number':
            case 'date':
            case 'email':
                fieldHTML += `
                    <input type="${type}" 
                           id="${id}" 
                           name="${id}"
                           ${value ? `value="${value}"` : ''}
                           ${placeholder ? `placeholder="${placeholder}"` : ''}
                           ${required ? 'required' : ''}>
                `;
                break;

            case 'textarea':
                fieldHTML += `
                    <textarea id="${id}" 
                              name="${id}"
                              rows="3"
                              ${placeholder ? `placeholder="${placeholder}"` : ''}
                              ${required ? 'required' : ''}>${value || ''}</textarea>
                `;
                break;

            case 'select':
                fieldHTML += `
                    <select id="${id}" name="${id}" ${required ? 'required' : ''}>
                        <option value="">Select ${label}</option>
                        ${options?.map(opt => 
                            `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>`
                        ).join('')}
                    </select>
                `;
                break;

            case 'checkbox':
                fieldHTML += `
                    <div class="checkbox-group">
                        <input type="checkbox" 
                               id="${id}" 
                               name="${id}"
                               ${value ? 'checked' : ''}>
                        <label for="${id}">${label}</label>
                    </div>
                `;
                break;
        }

        fieldHTML += '</div>';
        return fieldHTML;
    }

    // Modal form handling
    showModalForm(config) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = this.generateForm(config);
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const form = modal.querySelector('#dynamic-form');
        const cancelBtn = modal.querySelector('.cancel-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = this.getFormData(form);
            
            try {
                await config.onSubmit(formData);
                modal.remove();
            } catch (error) {
                console.error('Form submission error:', error);
                ui.showNotification('Error saving form data', 'error');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Validate form data
    validateFormData(formId, rules) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;

        rules.forEach(rule => {
            const field = form.querySelector(`[name="${rule.field}"]`);
            if (!field) return;

            const value = field.value.trim();

            if (rule.required && !value) {
                this.showFieldError(field.id, `${rule.label} is required`);
                isValid = false;
                return;
            }

            if (rule.type === 'email' && !utils.validateEmail(value)) {
                this.showFieldError(field.id, 'Please enter a valid email address');
                isValid = false;
                return;
            }

            if (rule.type === 'number') {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    this.showFieldError(field.id, 'Please enter a valid number');
                    isValid = false;
                    return;
                }

                if (rule.min !== undefined && numValue < rule.min) {
                    this.showFieldError(field.id, `Minimum value is ${rule.min}`);
                    isValid = false;
                    return;
                }

                if (rule.max !== undefined && numValue > rule.max) {
                    this.showFieldError(field.id, `Maximum value is ${rule.max}`);
                    isValid = false;
                    return;
                }
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                this.showFieldError(field.id, rule.message || 'Invalid format');
                isValid = false;
                return;
            }
        });

        return isValid;
    }

    // Auto-save form data
    setupAutoSave(formId, saveKey) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Load saved data
        const savedData = utils.getLocalStorage(saveKey, {});
        this.populateForm(formId, savedData);

        // Auto-save on input
        let saveTimeout;
        form.addEventListener('input', utils.debounce(() => {
            const formData = this.getFormData(form);
            utils.setLocalStorage(saveKey, formData);
        }, 1000));

        // Clear saved data on successful submit
        form.addEventListener('submit', () => {
            utils.removeLocalStorage(saveKey);
        });
    }

    // Form field formatting
    setupFieldFormatting(fieldId, formatter) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.addEventListener('input', (e) => {
            const formatted = formatter(e.target.value);
            e.target.value = formatted;
        });

        field.addEventListener('blur', (e) => {
            const formatted = formatter(e.target.value, true);
            e.target.value = formatted;
        });
    }

    // Currency formatter
    formatCurrencyInput(value, onBlur = false) {
        if (!value) return '';
        
        // Remove non-numeric characters
        let numeric = value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = numeric.split('.');
        if (parts.length > 2) {
            numeric = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Format with commas on blur
        if (onBlur && numeric) {
            const num = parseFloat(numeric);
            if (!isNaN(num)) {
                return num.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        }
        
        return numeric;
    }

    // Date formatter
    formatDateInput(value) {
        if (!value) return '';
        
        // Remove non-numeric characters
        let numeric = value.replace(/\D/g, '');
        
        // Format as DD/MM/YYYY
        if (numeric.length > 2) {
            numeric = numeric.substring(0, 2) + '/' + numeric.substring(2);
        }
        if (numeric.length > 5) {
            numeric = numeric.substring(0, 5) + '/' + numeric.substring(5, 9);
        }
        
        return numeric;
    }

    // Phone number formatter
    formatPhoneInput(value) {
        if (!value) return '';
        
        // Remove non-numeric characters
        let numeric = value.replace(/\D/g, '');
        
        // Format based on length
        if (numeric.length > 3 && numeric.length <= 6) {
            numeric = `(${numeric.substring(0, 3)}) ${numeric.substring(3)}`;
        } else if (numeric.length > 6) {
            numeric = `(${numeric.substring(0, 3)}) ${numeric.substring(3, 6)}-${numeric.substring(6, 10)}`;
        }
        
        return numeric;
    }
}

// Create singleton instance
const forms = new FarmForms();

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    forms.initForms();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = forms;
}
