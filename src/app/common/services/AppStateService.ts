import { Injectable } from '@angular/core';

import { UserStatistics } from 'app/common/interfaces/UserInterfaces';

export class AppState {
    rollingLogEntries: LogEntry[];
}

export class LogEntry {
    Message: string;
    milliseconds: number;
    level: number;
}

export class UserInfo {
    name: string;
}

const initialState: AppState = {
    rollingLogEntries: []
};

@Injectable()
export class AppStateService {
    appState: AppState =  initialState;

    appendLog(logMessage: string, level: number) {
        this.appState.rollingLogEntries =
            [... this.appState.rollingLogEntries, {Message: logMessage, milliseconds: Date.now(), level: level  } ];
        if (this.appState.rollingLogEntries.length > 120) {
            this.appState.rollingLogEntries = this.appState.rollingLogEntries.slice(20);
        }
    }


}
