const app = new Vue({
    el: '#app',

    data: {
        firstName: '',
        surname: '',
        email: '',
        ticketQuantity: 1,
        ticketType: 'general',
        referrals: [],
        specialRequests: '',
        purchaseAgreementSigned: false,
        requiredFieldClass: 'required'
    },

    computed: {
        fullName: {
            get: function() {
                if (this.firstName && this.surname) {
                    return ', ' + this.firstName + ' ' + this.surname + ',';
                }
            },

            set: function(newFullName) {
                const names = newFullName.split(' ');

                if (names.length === 2) {
                    this.firstName = names[0];
                    this.surname = names[1];
                }

                if (names.length <= 1) {
                    this.firstName = names[0] || '';
                    this.surname = ''
                }
            }
        },

        ticketDescription: function() {
            let readableTicketType = 'General Admission';

            if (this.ticketType === 'vip') {
                readableTicketType = 'VIP';
            }

            let ticketPluralisation = 'tickets';

            if (this.ticketQuantity === 1) {
                ticketPluralisation = 'ticket'
            }

            return this.ticketQuantity + ' ' + readableTicketType + ' ' + ticketPluralisation;
        },

        emailIsValid: function() {
            return this.email.includes('@');
        },

        formIsValid: function() {
            return this.firstName && this.surname && this.emailIsValid && this.purchaseAgreementSigned;
        },

        emailClasses: function() {
            return {
                touched: this.email.length !== 0,
                invalid: this.email && !this.emailIsValid
            };
        }
    },

    watch: {
        specialRequests: function (newRequests, oldRequests) {
            if (newRequests.toLowerCase().includes('birthday') || newRequests.toLowerCase().includes('anniversary')) {
                this.ticketType = 'vip';
            }
        }
    },

    methods: {
        resetFields: function() {
            this.firstName = '';
            this.surname = '';
            this.email = '';
            this.ticketQuantity = 1;
            this.ticketType = 'general';
            this.referrals = [];
            this.specialRequests = '';
            this.purchaseAgreementSigned = false;
        }
    }
});