import { Observable } from 'rxjs';
import { Message } from "./message";
import { User } from "./user";

export abstract class ChatAdapter
{
    // ### Abstract adapter methods ###

    public abstract listFriends(): Observable<User[]>;
    
    public abstract getMessageHistory(userId: any): Observable<Message[]>;

    public abstract sendMessage(message: Message): void;

    // ### Adapter/Chat income/ingress events ###

    // public abstract onFriendsListChanged(users: User[]): void
    // public abstract onMessageReceived(user: User, message: Message): void
    
    // public abstract onFriendsListChanged(users: User[]): void
    // {
    //     this.friendsListChangedHandler(users);
    // }

    // public abstract onMessageReceived(user: User, message: Message): void
    // {
    //     this.messageReceivedHandler(user, message);
    // }
    
    // // Event handlers
    // friendsListChangedHandler: (users: User[]) => void  = (users: User[]) => {};
    // messageReceivedHandler: (user: User, message: Message) => void = (user: User, message: Message) => {};
    
}