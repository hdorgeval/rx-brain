import {my} from "my-ts";
import * as rx from "rxjs";
import {IInputChannel, IObserverWithSubscription} from "./hillock.interface";

export class Hillock<T> implements IInputChannel<T> {
    private source: rx.Observable<T>;
    private observer: rx.Observer<T>;
    private subscription: rx.Subscription;
    public connectTo(source: rx.Observable<T>): IInputChannel<T> {
        throw new Error("Method not implemented.");
    }
    public observeWith(observer: IObserverWithSubscription<T>): IInputChannel<T> {
        throw new Error("Method not implemented.");
    }
    public get isDisconnected(): boolean {
        const source = this.source;
        if (my(source).isNullOrUndefined) {
            return true;
        }

        const subscription = this.subscription;
        if (my(subscription).isNullOrUndefined) {
            return true;
        }

        return false;
    }
}
