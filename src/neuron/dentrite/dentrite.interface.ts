import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
export interface IMultiInputChannel<T>{
    readonly isDisconnected: boolean;
    disconnectFrom(source: rx.Observable<T>): IMultiInputChannel<T>;
    connectTo(source: rx.Observable<T>): IMultiInputChannel<T>;
    observeWith(observer: IObserverWithSubscription<T>): IMultiInputChannel<T>;
}
