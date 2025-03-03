export function usePageScrollEmbla(options = {}) {
    let embla;
    let startEvent = null;
    let baselineMoveX = 0;
    let isSyntheticActive = false;
    let cleanup = () => { };
    const speed = options.speed ?? 10;
    function init(instance) {
        embla = instance;
        const container = embla.containerNode();
        function onUserPointerDown() {
            if (isSyntheticActive) {
                releaseSynthetic(baselineMoveX);
            }
        }
        container.addEventListener("mousedown", onUserPointerDown);
        container.addEventListener("touchstart", onUserPointerDown);
        function createRelativePointerEvent(type, moveX) {
            const relativeMovement = moveX - baselineMoveX;
            if (startEvent instanceof TouchEvent && startEvent.touches.length > 0) {
                const touch = startEvent.touches[0];
                const syntheticTouchEvent = new TouchEvent(type, {
                    touches: [
                        new Touch({
                            identifier: touch.identifier,
                            target: touch.target,
                            clientX: touch.clientX + relativeMovement,
                            clientY: touch.clientY,
                            screenX: touch.screenX + relativeMovement,
                            screenY: touch.screenY,
                            pageX: touch.pageX + relativeMovement,
                            pageY: touch.pageY,
                        }),
                    ],
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                });
                // @ts-expect-error - Mark the event as synthetic
                syntheticTouchEvent.synthetic = true;
                return syntheticTouchEvent;
            }
            const syntheticMouseEvent = new MouseEvent(type, {
                clientX: startEvent?.clientX + relativeMovement,
                clientY: startEvent?.clientY ?? 0,
                screenX: startEvent?.screenX + relativeMovement,
                screenY: startEvent?.screenY ?? 0,
                movementX: relativeMovement,
                movementY: 0,
                button: 0,
                bubbles: true,
                cancelable: true,
                composed: true,
            });
            // @ts-expect-error - Mark the event as synthetic
            syntheticMouseEvent.synthetic = true;
            return syntheticMouseEvent;
        }
        function dispatchEvent(event) {
            container.dispatchEvent(event);
        }
        function onScroll() {
            const sTop = window.scrollY;
            const hgt = document.documentElement.scrollHeight - window.innerHeight;
            const fValue = (sTop / hgt) * 100;
            const moveX = -speed * fValue;
            if (!isSyntheticActive) {
                baselineMoveX = moveX;
                startEvent = new MouseEvent("mousedown", {
                    clientX: 0,
                    clientY: 0,
                    button: 0,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                });
                // @ts-expect-error - Mark the event as synthetic
                startEvent.synthetic = true;
                dispatchEvent(startEvent);
                isSyntheticActive = true;
            }
            const syntheticMove = createRelativePointerEvent("mousemove", moveX);
            dispatchEvent(syntheticMove);
            if (sTop >= hgt) {
                releaseSynthetic(moveX);
            }
        }
        function releaseSynthetic(moveX) {
            if (isSyntheticActive) {
                const syntheticUp = createRelativePointerEvent("mouseup", moveX);
                dispatchEvent(syntheticUp);
                isSyntheticActive = false;
            }
        }
        function onGlobalPointerMove(e) {
            if (isSyntheticEvent(e))
                return;
            if (e.isTrusted && isSyntheticActive) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
        function onWindowPointerUp(e) {
            if (isSyntheticEvent(e))
                return;
            releaseSynthetic(0);
        }
        function isSyntheticEvent(event) {
            // @ts-expect-error - Check the synthetic marker
            return event.synthetic === true;
        }
        window.addEventListener("scroll", onScroll);
        window.addEventListener("mousemove", onGlobalPointerMove, true);
        window.addEventListener("mouseup", onWindowPointerUp);
        window.addEventListener("touchmove", onGlobalPointerMove, true);
        window.addEventListener("touchend", onWindowPointerUp);
        cleanup = () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("mousemove", onGlobalPointerMove, true);
            window.removeEventListener("mouseup", onWindowPointerUp);
            window.removeEventListener("touchmove", onGlobalPointerMove, true);
            window.removeEventListener("touchend", onWindowPointerUp);
            container.removeEventListener("mousedown", onUserPointerDown);
            container.removeEventListener("touchstart", onUserPointerDown);
        };
    }
    return {
        name: "PageScrollEmblaPlugin",
        options,
        init,
        destroy: () => cleanup(),
    };
}
//# sourceMappingURL=PageScrollEmblaPlugin.js.map