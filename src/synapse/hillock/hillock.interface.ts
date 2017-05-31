import * as rx from "rxjs";

export interface IInputChannel<T>{
    readonly isDisconnected: boolean;
    connectTo(source: rx.Observable<T>): IInputChannel<T>;
    observeWith(observer: IObserverWithSubscription<T>): IInputChannel<T>;
}

export interface IObserverWithSubscription<T> {
    observer: rx.Observer<T>;
    subscription: rx.Subscription;
}
