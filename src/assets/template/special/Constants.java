package {{ package_name }};

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Constants {

    public static final String MOD_ID = {{ mod_id }};
    public static final Logger LOGGER = LogManager.getLogger(MOD_ID);

}