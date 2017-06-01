import {my} from "my-ts";
import * as rx from "rxjs";
import {IInputChannel, IObserverWithSubscription} from "./hillock.interface";

export class Hillock<T> implements IInputChannel<T> {
    private source: rx.Observable<T>;
    private observerWithSubscription: IObserverWithSubscription<T>;
    private get hasObserver() {
        const observerWithSubscription = this.observerWithSubscription;
        if (my(observerWithSubscription).isNullOrUndefinedOrEmpty) {
            return false;
        }

        const observer = this.observerWithSubscription.observer;
        if (my(observer).isNullOrUndefined) {
            return false;
        }

        return true;
    }
    private get hasNoObserver() {
        return this.hasObserver === false;
    }
    private get hasObserverWithNoSubscription() {
        if (this.hasObserver === false) {
            return false;
        }
        const subscription = this.observerWithSubscription.subscription;
        if (my(subscription).isNullOrUndefined) {
            return true;
        }
        return false;
    }

    public connectTo(source: rx.Observable<T>): IInputChannel<T> {
        this.source = source;
        if (this.hasObserverWithNoSubscription) {
            this.observerWithSubscription.subscription = this.source.subscribe(this.observerWithSubscription.observer);
        }

        return this;
    }
    public observeWith(observer: IObserverWithSubscription<T>): IInputChannel<T> {
        this.observerWithSubscription = {...observer};
        if (this.hasObserverWithNoSubscription) {
            observer.subscription = this.observerWithSubscription.subscription
                                  = this.source.subscribe(this.observerWithSubscription.observer);
            observer.subscription = this.observerWithSubscription.subscription;
        }
        return this;
    }
    public get isDisconnected(): boolean {
        const source = this.source;
        if (my(source).isNullOrUndefined) {
            return true;
        }

        if (this.hasNoObserver) {
            return true;
        }

        if (this.hasObserverWithNoSubscription) {
            return true;
        }

        return false;
    }
}
