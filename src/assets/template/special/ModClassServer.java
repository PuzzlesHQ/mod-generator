package {{ package_name }};

import dev.puzzleshq.puzzleloader.loader.mod.entrypoint.server.ServerModInit;

public class Server{{ mod_class_name }} implements ServerModInit {

    @Override
        public void onServerInit() {
            Constants.LOGGER.info("Hello from ServerInit in {}", Server{{ mod_class_name }}.class);
        }

}
