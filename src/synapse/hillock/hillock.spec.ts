import {my} from "my-ts";
import * as rx from "rxjs";
import { IInputChannel,  IObserverWithSubscription} from "./hillock.interface";
import {Hillock} from "./hillock.template";

let hillock: IInputChannel<any>;
let sourceStream: rx.Subject<any>;
let otherSourceStream: rx.Subject<any>;
let observerWithSubscription: IObserverWithSubscription<any> ;
let nextMethodOfObserver: jest.SpyInstance<any>;

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
    };
});

beforeEach(() => {
    hillock = new Hillock<any>();
    sourceStream = new rx.Subject();
    otherSourceStream = new rx.Subject();
    nextMethodOfObserver = jest.spyOn(observerWithSubscription.observer, "next");
});

afterEach(() => {
    nextMethodOfObserver.mockRestore();
    sourceStream.complete();
    otherSourceStream.complete();
});

test("hillock is initially disconnected", () => {
    // Given

    // When

    // Then
    expect(hillock.isDisconnected).toBeTruthy();
});

test("hillock should not connect to the data source when there is no observer", () => {
    // Given
    sourceStream.next(0);

    // When
    hillock.connectTo(sourceStream);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeTruthy();
});

test("when hillock is connected to a data source, it should take data from that source only when there is an observer", () => {
    // Given
    hillock.connectTo(sourceStream);
    sourceStream.next(0);

    // When
    hillock.observeWith(observerWithSubscription);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(1);
});


test(`Given hillock is connected to a data source
      and hillock has an observer
      When hillock is connected to another data source
      Then the observer should not receive data from primary data source`
    , () => {
    // Given
    hillock.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    hillock.connectTo(otherSourceStream);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
});
