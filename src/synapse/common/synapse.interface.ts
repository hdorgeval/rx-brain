import * as rx from "rxjs";

export interface IObserverWithSubscription<T> {
    observer: rx.Observer<T>;
    subscription: rx.Subscription;
}
