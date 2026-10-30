package com.gamesforlife.roadtoagi;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        // De layout schaalt zelf mee met het scherm; een grotere systeemletter
        // zou knoppen en tellers anders uit hun vakken duwen.
        getBridge().getWebView().getSettings().setTextZoom(100);
    }
}
