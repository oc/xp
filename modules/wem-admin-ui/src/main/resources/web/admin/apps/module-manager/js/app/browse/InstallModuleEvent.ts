module app.browse {

    import Event = api.event.Event;

    export class InstallModuleEvent extends Event {

        static on(handler: (event: InstallModuleEvent) => void) {
            Event.bind(api.util.getFullName(this), handler);
        }

        static un(handler?: (event: InstallModuleEvent) => void) {
            Event.unbind(api.util.getFullName(this), handler);
        }
    }
}
