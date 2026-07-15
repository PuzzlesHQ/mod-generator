package {{ package_name }};

import dev.puzzleshq.puzzleloader.loader.mod.entrypoint.client.ClientModInit;
import dev.puzzleshq.puzzleloader.loader.mod.entrypoint.client.ClientPostModInit;
import dev.puzzleshq.puzzleloader.loader.mod.entrypoint.client.ClientPreModInit;

public class Client{{ mod_class_name }} implements ClientPreModInit, ClientModInit, ClientPostModInit {

    @Override
    public void onClientPreInit() {
        Constants.LOGGER.info("Hello from ClientPreInit in {}", Client{{ mod_class_name }}.class);
    }

    @Override
    public void onClientInit() {
        Constants.LOGGER.info("Hello from ClientInit in {}", Client{{ mod_class_name }}.class);
    }

    @Override
    public void onClientPostInit() {
        Constants.LOGGER.info("Hello from ClientPostInit in {}", Client{{ mod_class_name }}.class);
    }

}
