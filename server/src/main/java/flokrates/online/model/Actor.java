package flokrates.online.model;

import java.util.Arrays;

public enum Actor {
    FLOKRATES("FL", "Flokrates"),
    PABLO("PA", "Pablo"),
    LOTHARIUS("LO", "Lotharius");

    private final String code;
    private final String displayName;

    Actor(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

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