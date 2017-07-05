import {my} from "my-ts";
import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
import { IMultiInputChannel } from "./dentrite.interface";
import { Dentrite } from "./dentrite.template";

let dentrite: IMultiInputChannel<any>;
let sourceStream: rx.Subject<any>;
let otherSourceStream: rx.Subject<any>;
let observerWithSubscription: IObserverWithSubscription<any> ;
let otherObserverWithSubscription: IObserverWithSubscription<any> ;
let nextMethodOfObserver: jest.SpyInstance<any>;
let nextMethodOfOtherObserver: jest.SpyInstance<any>;

// tslint:disable:no-console
// tslint:disable:object-literal-sort-keys
// tslint:disable:max-line-length

beforeAll(() => {
    observerWithSubscription = {
        observer : {
            next: (x) => {
                console.log("Observer got a next value: " + x); },
            error: (err) => console.error("Observer got an error: " + err),
            complete: () => console.log("Observer got a complete notification"),
        },
        subscription: null,
        id: "o1",
    };
    otherObserverWithSubscription = {
        observer : {
            next: (x) => {
                console.log("Other Observer got a next value: " + x); },
            error: (err) => console.error("Other Observer got an error: " + err),
            complete: () => console.log("Other Observer got a complete notification"),
        },
        subscription: null,
        id: "o2",
    };
});

beforeEach(() => {
    dentrite = new Dentrite<any>();
    sourceStream = new rx.Subject();
    otherSourceStream = new rx.Subject();
    nextMethodOfObserver = jest.spyOn(observerWithSubscription.observer, "next");
    nextMethodOfOtherObserver = jest.spyOn(otherObserverWithSubscription.observer, "next");
});

afterEach(() => {
    nextMethodOfObserver.mockRestore();
    nextMethodOfOtherObserver.mockRestore();
    sourceStream.complete();
    otherSourceStream.complete();
});

test("dentrite is initially disconnected", () => {
    // Given

    // When

    // Then
    expect(dentrite.isDisconnected).toBe(true);
});
