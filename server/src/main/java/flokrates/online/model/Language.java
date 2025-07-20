package flokrates.online.model;

import java.util.Arrays;

public enum Language {
    GE("GE", "GERMAN"),
    EN("EN", "English");

    private final String code;
    private final String displayName;

    Language(String code, String displayName) {
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

    public static Language fromCode(String code) {
        return Arrays.stream(values())
                .filter(lang -> lang.code.equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown code: " + code));
    }

    public static Language fromDisplayName(String name) {
        return Arrays.stream(values())
                .filter(lang -> lang.displayName.equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown display name: " + name));
    }
}

/*
Language lang = Language.DE;
System.out.println(lang);  // Prints: German
System.out.println(lang.language);  // Also prints: German
 */
