import {my} from "my-ts";
import * as rx from "rxjs";
import { IObserverWithSubscription } from "../../common/common.interfaces";
import { IInputChannel} from "./hillock.interface";
import {Hillock} from "./hillock.template";

let hillock: IInputChannel<any>;
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
    hillock = new Hillock<any>();
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

test("hillock is initially disconnected", () => {
    // Given

    // When

    // Then
    expect(hillock.isDisconnected).toBeTruthy();
});

test(`Given a data source that emits data
      And hillock has no observer
      When hillock connects to that data source
      Then hillock should stay disconnected`
    , () => {
    // Given
    sourceStream.next(0);

    // When
    hillock.connectTo(sourceStream);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeTruthy();
});

test(`Given hillock is connected to a data source
      And there is no observer
      And the data source is emitting data
      When an observer connects to the hillock
      Then the observer should receive the data that was sent only after the subscription`
    , () => {
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
      And hillock has an observer
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

test(`Given hillock is connected to a data source
      And hillock has an observer
      When hillock is connected to another data source
      Then the observer should receive data from this other data source`
    , () => {
    // Given
    hillock.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);
    otherSourceStream.next(1);

    // When
    hillock.connectTo(otherSourceStream);
    sourceStream.next(2);
    otherSourceStream.next(3);

    // Then
    expect(hillock.isDisconnected).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(3);
});

test(`Given hillock is not connected to a data source
      When an observer connects to this hillock
      Then the hillock should stay disconnected
      And the observer should not receive any data`
    , () => {
    // Given
    sourceStream.next(0);

    // When
    hillock.observeWith(observerWithSubscription);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(0);
});

test(`Given hillock is connected to a data source
      And there is no observer
      And the data source is emitting data
      When a null observer connects to the hillock
      Then the hillock should stay disconnected`
    , () => {
    // Given
    hillock.connectTo(sourceStream);
    sourceStream.next(0);

    // When
    hillock.observeWith(null);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeTruthy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(0);
});

test(`Given hillock is connected to a data source
      And hillock has an observer
      When another observer connects to the hillock
      Then the first observer should not receive any more data from the data source
      And the new observer should receive the data that was sent only after its subscription`
    , () => {
    // Given
    hillock.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    hillock.observeWith(otherObserverWithSubscription);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfOtherObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfOtherObserver).toBeCalledWith(1);
});

test(`Given hillock is connected to a data source
      And hillock has an observer
      When same observer reconnects to the hillock
      Then the observer should continue to receive data from the data source`
    , () => {
    // Given
    hillock.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    hillock.observeWith(observerWithSubscription);
    sourceStream.next(1);

    // Then
    expect(hillock.isDisconnected).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
});

test(`Given hillock is connected to a data source
      And hillock has an observer
      When this observer disconnects
      And reconnects to the hillock after a while
      Then the observer should not receive the data emitted in between
      But the observer should continue to receive data emitted after its second subscription`
    , () => {
    // Given
    hillock.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    observerWithSubscription.subscription.unsubscribe();
    observerWithSubscription.subscription = null;
    sourceStream.next(1);
    hillock.observeWith(observerWithSubscription);
    sourceStream.next(2);

    // Then
    expect(hillock.isDisconnected).toBeFalsy();
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(2);
});
