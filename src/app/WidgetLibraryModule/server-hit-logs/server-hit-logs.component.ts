import { Component, OnInit, Input } from '@angular/core';

import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { ManagedCacheHitLog } from 'app/common/interfaces/DisplayInterfaces';
import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { AppStateService } from 'app/common/services/AppStateService';

import { LightNode } from '../network-diagram/helper-classes';

@Component({
  selector: 'app-server-hit-logs',
  templateUrl: './server-hit-logs.component.html',
  styleUrls: ['./server-hit-logs.component.css']
})
export class ServerHitLogsComponent implements OnInit {

  @Input() Config: WidgetConfiguration[];

  PolicyGroups: PolicyGroup[] = [];
  rootNode: LightNode;
  ManagedCacheHitLogs: ManagedCacheHitLog[] = [];

  constructor(private EngWebApiService: EngWebApiService, private appStateService: AppStateService) { }

  ngOnInit() {
    this.Refresh();
  }

  onNodeSelect(selectedNode: LightNode) {
    console.log('node selected.');
    let temp: ManagedCacheHitLog[] = [];

    if (selectedNode.Name === 'Policy') {
      this.PolicyGroups.forEach( pg => {
        pg.KeyGroups.forEach( kg => {
          kg.HitTypeGroups.forEach(htg => {
            temp = temp.concat(htg.ManagedCacheHitLogs);
          });
        });
      });
    }
    if (selectedNode.Tag instanceof PolicyGroup) {
      const asPG = <PolicyGroup>selectedNode.Tag;
      asPG.KeyGroups.forEach( kg => {
        kg.HitTypeGroups.forEach( htg => {

          temp = temp.concat(htg.ManagedCacheHitLogs);
        });
      });
    } else if (selectedNode.Tag instanceof KeyGroup) {
      const asKeyGroup = <KeyGroup>selectedNode.Tag;
        asKeyGroup.HitTypeGroups.forEach( htg => {
          temp = temp.concat(htg.ManagedCacheHitLogs);
        });
    } else if (selectedNode.Tag instanceof HitTypeGroup) {
      const asHitTypeGroup = <HitTypeGroup>selectedNode.Tag;
      temp = asHitTypeGroup.ManagedCacheHitLogs;
    }
    this.ManagedCacheHitLogs = temp;
  }


  Refresh() {

      this.EngWebApiService.GetManagedCacheHitLogs().subscribe(
            reply => {

                const rootNode = new LightNode('Policy');

                const tempPG: PolicyGroup[]  = [];
                reply.forEach( hitLog => {
                  let pgln = rootNode.Next.find(x => x.Name === hitLog.dataPolicy);
                  let pg = tempPG.find(x => x.DataPolicy === hitLog.dataPolicy );
                  if (pg === undefined) {
                    pg = new PolicyGroup();
                    pg.DataPolicy = hitLog.dataPolicy;
                    tempPG.push(pg);

                    pgln = new LightNode(hitLog.dataPolicy);
                    pgln.Tag = pg;
                    rootNode.Next.push(pgln);
                  }

                  let kg = pg.KeyGroups.find(x => x.Key === hitLog.key);
                  let kgln = pgln.Next.find(x => x.Name === hitLog.key);

                  if (kg === undefined) {
                    kg = new KeyGroup();
                    kg.Key = hitLog.key;
                    pg.KeyGroups.push(kg);

                    kgln = new LightNode(hitLog.key);
                    kgln.Tag = kg;
                    pgln.Next.push(kgln);
                  }

                  let htg = kg.HitTypeGroups.find(x => x.HitType === hitLog.client);
                  let htgln = kgln.Next.find (x => x.Name === hitLog.client);

                  if (htg === undefined) {
                    htg = new HitTypeGroup();
                    htg.HitType = hitLog.client;
                    kg.HitTypeGroups.push(htg);

                    htgln = new LightNode(hitLog.client);
                    htgln.Tag = htg;
                    kgln.Next.push(htgln);
                  }
                  htg.ManagedCacheHitLogs.push(hitLog);
                });

                this.BadgeOut(rootNode);
                this.PolicyGroups = tempPG;
                this.rootNode = rootNode;
            },
            error => this.appStateService.appendLog('GetManagedCacheHitLogs ERROR: ' + JSON.stringify(error), 1));
    }

    BadgeOut(node: LightNode): number {
      if (node.Next.length === 0 || node.Next === undefined) {
        const asHitTypeGroup = <HitTypeGroup>node.Tag;
        if (asHitTypeGroup !== undefined) {
          node.Name += ` (${asHitTypeGroup.ManagedCacheHitLogs.length.toString()})`;

          return asHitTypeGroup.ManagedCacheHitLogs.length;
        }
      } else {
        let accumulator = 0;
        node.Next.forEach(child => accumulator += this.BadgeOut(child));
        node.Name += ` (${accumulator.toString()})`;
        return accumulator;
      }

    }
}

class PolicyGroup {
  DataPolicy: string;
  KeyGroups: KeyGroup[] = [];
}

class KeyGroup {
  Key: string;
  HitTypeGroups: HitTypeGroup[] = [];
}

class HitTypeGroup {
  HitType: string;
  ManagedCacheHitLogs: ManagedCacheHitLog[] = [];
}

