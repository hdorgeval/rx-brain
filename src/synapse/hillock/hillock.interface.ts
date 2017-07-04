import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
export interface IInputChannel<T>{
    readonly isDisconnected: boolean;
    connectTo(source: rx.Observable<T>): IInputChannel<T>;
    observeWith(observer: IObserverWithSubscription<T>): IInputChannel<T>;
}
