package flokrates.online.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum Actor {
    FLO("FLO", "Flokrates"),
    PAB("PAB", "Pablo"),
    LOT("LOT", "Lotharius");

    private final String code;
    private final String displayName;

    Actor(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }

    @JsonCreator
    public static Actor fromCode(String code) {
        return Arrays.stream(values())
                .filter(actor -> actor.code.equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + code));
    }

    public static Actor fromDisplayName(String name) {
        return Arrays.stream(values())
                .filter(actor -> actor.displayName.equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown display name: " + name));
    }
}


/*
Name name = Name.FL;
System.out.println(name);  // Prints: Flokrates
System.out.println(name.name);  // Also prints: Flokrates
 */