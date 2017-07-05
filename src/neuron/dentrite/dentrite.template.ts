import {my} from "my-ts";
import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
import { IMultiInputChannel } from "./dentrite.interface";

export class Dentrite<T> implements IMultiInputChannel<T> {
    public isDisconnected: boolean = true;
    public disconnectFrom(source: rx.Observable<T>): IMultiInputChannel<T> {
        throw new Error("Method not implemented.");
    }
    public connectTo(source: rx.Observable<T>): IMultiInputChannel<T> {
        throw new Error("Method not implemented.");
    }
    public observeWith(observer: IObserverWithSubscription<T>): IMultiInputChannel<T> {
        throw new Error("Method not implemented.");
    }

}
