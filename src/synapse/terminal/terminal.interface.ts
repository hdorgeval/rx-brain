import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
export interface IOutputChannel<T>{
    readonly hasConnections: boolean;
    transmit(vesicle: T): IOutputChannel<T>;
    observeWith(observer: IObserverWithSubscription<T>): IOutputChannel<T>;
}
