package {{ package_name }};

import dev.puzzleshq.puzzleloader.loader.mod.entrypoint.common.ModInit;

import static {{ package_name }}.Constants.MOD_ID;

public class Init{{ mod_class_name }} implements ModInit {

    public Init{{ mod_class_name }}() {}

    @Override
    public void onInit() {
        Constants.LOGGER.info("Hello from {}", Init{{ mod_class_name }}.class);
    }
}
