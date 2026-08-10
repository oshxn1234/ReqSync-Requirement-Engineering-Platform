package com.reqsync.reqsync_backend.userstory.config;

import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.userstory.service.UserStoryAndSrsGenerationService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserStoryAndSrsConfig {

    @Bean
    public UserStoryAndSrsGenerationService userStoryAndSrsGenerationService(
            GeminiClient geminiClient
    ) {
        return new UserStoryAndSrsGenerationService(geminiClient);
    }
}
