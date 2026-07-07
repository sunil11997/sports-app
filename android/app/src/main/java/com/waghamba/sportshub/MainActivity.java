package com.waghamba.sportshub;

import android.os.Bundle;
import androidx.annotation.NonNull;
import com.sunil.physical.R;
import com.getcapacitor.BridgeActivity;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Access the YouTubePlayerView defined in the activity_main.xml layout
        YouTubePlayerView youTubePlayerView = findViewById(R.id.youtube_player_view);
        
        if (youTubePlayerView != null) {
            // Add the player as a lifecycle observer to handle play/pause automatically
            getLifecycle().addObserver(youTubePlayerView);

            youTubePlayerView.addYouTubePlayerListener(new AbstractYouTubePlayerListener() {
                @Override
                public void onReady(@NonNull YouTubePlayer youTubePlayer) {
                    // This cues a default technical mastery video for the Sports Hub.
                    // "S8XWf8p0Urc" is a placeholder ID for technical sports content.
                    // This can be replaced with dynamic IDs fetched from your Registry.
                    String videoIdFromRegistry = "S8XWf8p0Urc";
                    youTubePlayer.cueVideo(videoIdFromRegistry, 0);
                }
            });
        }
    }
}
