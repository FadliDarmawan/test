import PrivateContact from '../func/PrivateContact.js';
import BusinessContact from '../func/BusinessContact.js';

export default class ContactFactory {
    static create(client, data) {
        if(data.isBusiness) {
            return new BusinessContact(client, data);
        }

        return new PrivateContact(client, data);
    }
}
