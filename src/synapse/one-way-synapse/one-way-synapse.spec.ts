import { my } from "my-ts";
import * as rx from "rxjs";
import { IObserverWithSubscription } from "../common/synapse.interface";
import { Hillock } from "../hillock/hillock.template";
import { Terminal } from "../terminal/terminal.template";
import { IOneWaySynapse } from "./one-way-synapse.interface";
import { OneWaySynapse } from "./one-way-synapse.template";

let synapse: IOneWaySynapse<any>;
let sourceStream: rx.Subject<any>;
let otherSourceStream: rx.Subject<any>;
let observerWithSubscription: IObserverWithSubscription<any> ;
let otherObserverWithSubscription: IObserverWithSubscription<any> ;
let badObserverWithSubscription: IObserverWithSubscription<any>;
let nextMethodOfObserver: jest.SpyInstance<any>;
let nextMethodOfOtherObserver: jest.SpyInstance<any>;
let nextMethodOfBadObserver: jest.SpyInstance<any>;

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
    badObserverWithSubscription = {
        observer : {
            next: (x) => {
                throw new Error("exception raised by Bad Observer");
                 },
            error: (err) => console.error("Bad Observer got an error: " + err),
            complete: () => console.log("Bad Observer got a complete notification"),
        },
        subscription: null,
        id: "bad1",
    };
});

beforeEach(() => {
    synapse = new OneWaySynapse<any>(new Hillock<any>(), new Terminal<any>());
    sourceStream = new rx.Subject();
    otherSourceStream = new rx.Subject();
    nextMethodOfObserver = jest.spyOn(observerWithSubscription.observer, "next");
    nextMethodOfOtherObserver = jest.spyOn(otherObserverWithSubscription.observer, "next");
    nextMethodOfBadObserver = jest.spyOn(badObserverWithSubscription.observer, "next");
});

afterEach(() => {
    nextMethodOfObserver.mockRestore();
    nextMethodOfOtherObserver.mockRestore();
    nextMethodOfBadObserver.mockRestore();
    sourceStream.complete();
    otherSourceStream.complete();
});

test(`When a new synapse is created
      Then this synapse should be disconnected from any data source
      And should have no observer`
    , () => {
    // Given

    // When

    // Then
    expect(synapse.isDisconnected).toBe(true);
    expect(synapse.hasConnections).toBe(false);
});

test(`Given a data source that emits data
      And synapse has no observer
      When synapse connects to that data source
      Then synapse should stay disconnected`
    , () => {
    // Given
    sourceStream.next(0);

    // When
    synapse.connectTo(sourceStream);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(true);
    expect(synapse.hasConnections).toBe(false);
});

test(`Given a data source that emits data
      And synapse has no observer
      When synapse connects multiple times to that data source
      Then synapse should stay disconnected`
    , () => {
    // Given
    sourceStream.next(0);

    // When
    synapse.connectTo(sourceStream)
           .connectTo(sourceStream);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(true);
    expect(synapse.hasConnections).toBe(false);
});

test(`Given synapse is connected to a data source
      And there is no observer
      And the data source is emitting data
      When an observer connects to the synapse
      Then the observer should receive the data that was sent only after the subscription`
    , () => {
    // Given
    synapse.connectTo(sourceStream);
    sourceStream.next(0);

    // When
    synapse.observeWith(observerWithSubscription);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(1);
});

test(`Given synapse is connected to a data source
      And synapse has an observer
      When synapse is connected to another data source
      Then the observer should not receive data from primary data source`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    synapse.connectTo(otherSourceStream);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
});

test(`Given synapse is connected to a data source
      And synapse has an observer
      When synapse is connected to another data source
      Then the observer should receive data from this other data source`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);
    otherSourceStream.next(1);

    // When
    synapse.connectTo(otherSourceStream);
    sourceStream.next(2);
    otherSourceStream.next(3);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(3);
});

test(`Given synapse is not connected to a data source
      When an observer connects to this synapse
      Then the synapse should stay disconnected
      And the observer should not receive any data`
    , () => {
    // Given
    sourceStream.next(0);

    // When
    synapse.observeWith(observerWithSubscription);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(true);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(0);
});

test(`Given synapse is connected to a data source
      And there is no observer
      And the data source is emitting data
      When a null or undefined observer connects to the synapse
      Then the synapse should stay disconnected`
    , () => {
    // Given
    synapse.connectTo(sourceStream);
    sourceStream.next(0);

    // When
    synapse.observeWith(null);
    synapse.observeWith(undefined);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(true);
    expect(synapse.hasConnections).toBe(false);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(0);
});

test(`Given synapse is connected to a data source
      And synapse has an observer
      And the data source is emitting data
      When another observer connects to the synapse
      Then the first observer should continue to receive data
      And the new observer should receive the data that was sent only after its subscription`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    synapse.observeWith(otherObserverWithSubscription);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
    expect(nextMethodOfOtherObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfOtherObserver).toBeCalledWith(1);
});

test(`Given synapse is connected to a data source
      And synapse has an observer
      When same observer reconnects to the synapse
      Then the observer should continue to receive data from the data source
      And this observer should receive this data only once`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    synapse.observeWith(observerWithSubscription);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
});

test(`Given synapse is connected to a data source
      And synapse has an observer
      When this observer disconnects
      And reconnects to the synapse after a while
      Then the observer should not receive the data emitted in between
      But the observer should continue to receive data emitted after its second subscription`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    observerWithSubscription.subscription.unsubscribe();
    sourceStream.next(1);
    synapse.observeWith(observerWithSubscription);
    sourceStream.next(2);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(2);
});

test(`Given synapse is connected to a data source
      And this synapse has one observer
      When this observer disconnects
      And the data source is emitting data
      Then the observer should not receive data anymore
      And the synapse should stay connected to the data source`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription);
    sourceStream.next(0);

    // When
    observerWithSubscription.subscription.unsubscribe();
    sourceStream.next(1);
    sourceStream.next(2);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(false);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
});

test(`Given synapse is connected to a data source
      And a synapse has two observers
      When the data source is emitting data
      Then both observers should receive this data`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(observerWithSubscription)
           .observeWith(otherObserverWithSubscription);

    // When
    sourceStream.next(0);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfOtherObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfOtherObserver).toBeCalledWith(0);
});

test(`Given synapse is connected to a data source
      And synapse has one observer
      When the data source is emitting data
      And this observer throws an error
      Then this observer should not receive any more data
      And this observer should be automatically disconnected`
    , () => {
    // Given
    synapse.connectTo(sourceStream)
           .observeWith(badObserverWithSubscription);

    // When
    sourceStream.next(0);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(false);
    expect(nextMethodOfBadObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfBadObserver).toBeCalledWith(0);
});

test(`Given synapse is connected to a data source
      And synapse has two observers
      When the data source is emitting data
      And the first observer throws an error
      Then the second observer should receive this data
      And any other data transmitted afterwards
      But the first observer should not receive any more data`
    , () => {
    // Given
    synapse.observeWith(badObserverWithSubscription)
           .observeWith(observerWithSubscription)
           .connectTo(sourceStream);

    // When
    sourceStream.next(0);
    sourceStream.next(1);

    // Then
    expect(synapse.isDisconnected).toBe(false);
    expect(synapse.hasConnections).toBe(true);
    expect(nextMethodOfObserver).toHaveBeenCalledTimes(2);
    expect(nextMethodOfObserver).toBeCalledWith(0);
    expect(nextMethodOfObserver).toBeCalledWith(1);
    expect(nextMethodOfBadObserver).toHaveBeenCalledTimes(1);
    expect(nextMethodOfBadObserver).toBeCalledWith(0);
});
